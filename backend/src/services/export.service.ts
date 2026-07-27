import type { CallRecord } from "@prisma/client";
import { callRecordRepository } from "@/repositories/callRecord.repository";
import { analyticsRepository } from "@/repositories/analytics.repository";
import { toCsvRow } from "@/utils/csv";
import type { CallRecordFilters } from "@/types/callFilters";

const CSV_HEADERS = [
  "ID",
  "Caller Name",
  "Caller Number",
  "Receiver Number",
  "City",
  "Direction",
  "Status",
  "Duration (seconds)",
  "Cost",
  "Start Time",
  "End Time",
];

function callRecordToCsvRow(record: CallRecord): string {
  return toCsvRow([
    record.id,
    record.callerName,
    record.callerNumber,
    record.receiverNumber,
    record.city,
    record.direction,
    record.status,
    record.durationSeconds,
    Number(record.cost).toFixed(2),
    record.startTime.toISOString(),
    record.endTime.toISOString(),
  ]);
}

/** Yields CSV lines for the full filtered result set, batch by batch, never buffering the whole export in memory. */
export async function* streamCallsCsv(
  filters: CallRecordFilters,
): AsyncGenerator<string> {
  yield toCsvRow(CSV_HEADERS);
  for await (const batch of callRecordRepository.iterate(filters, 1000)) {
    for (const record of batch) {
      yield callRecordToCsvRow(record);
    }
  }
}

const MAX_PDF_ROWS = 2000;
export const PDF_PAGE_MARGIN = 40;
const PAGE_MARGIN = PDF_PAGE_MARGIN;
const ROW_HEIGHT = 16;

function formatPdfDate(date: Date): string {
  return date.toISOString().slice(0, 16).replace("T", " ");
}

// Landscape A4 is 842pt wide; with the 40pt margin on each side (see
// PDF_PAGE_MARGIN) that leaves 762pt to lay out across all columns below.
const PDF_COLUMNS: Array<{
  label: string;
  width: number;
  get: (r: CallRecord) => string;
}> = [
  { label: "Start Time", width: 90, get: (r) => formatPdfDate(r.startTime) },
  { label: "End Time", width: 90, get: (r) => formatPdfDate(r.endTime) },
  { label: "Caller Name", width: 95, get: (r) => r.callerName },
  { label: "Caller #", width: 75, get: (r) => r.callerNumber },
  { label: "Receiver #", width: 75, get: (r) => r.receiverNumber },
  { label: "City", width: 75, get: (r) => r.city },
  { label: "Direction", width: 55, get: (r) => r.direction },
  { label: "Status", width: 50, get: (r) => r.status },
  { label: "Dur (s)", width: 40, get: (r) => String(r.durationSeconds) },
  { label: "Cost", width: 45, get: (r) => `$${Number(r.cost).toFixed(2)}` },
];

function drawTableHeader(doc: PDFKit.PDFDocument, x: number, y: number): void {
  doc.font("Helvetica-Bold").fontSize(8);
  let cursor = x;
  for (const column of PDF_COLUMNS) {
    doc.text(column.label, cursor, y, { width: column.width, ellipsis: true });
    cursor += column.width;
  }
  doc
    .moveTo(x, y + 12)
    .lineTo(cursor, y + 12)
    .strokeColor("#cccccc")
    .stroke();
  doc.font("Helvetica").fontSize(8);
}

interface PdfReportOptions {
  title?: string;
  appliedFilters?: Record<string, unknown>;
}

/**
 * Writes a call records report to a pdfkit document that the caller has
 * already piped to the HTTP response, so bytes flow to the client as pages
 * are laid out rather than buffering the entire PDF in memory first.
 */
export async function writeCallsPdfReport(
  doc: PDFKit.PDFDocument,
  filters: CallRecordFilters,
  options: PdfReportOptions = {},
): Promise<void> {
  const summaryRow = await analyticsRepository.summary(filters);

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .text(options.title ?? "Call Records Report");
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#555555")
    .text(`Generated ${new Date().toISOString()}`);

  const filterEntries = Object.entries(options.appliedFilters ?? {}).filter(
    ([, value]) => value !== undefined,
  );
  if (filterEntries.length > 0) {
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#000000").text("Applied filters");
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#333333")
      .text(
        filterEntries.map(([key, value]) => `${key}: ${String(value)}`).join("   |   "),
      );
  }

  doc.moveDown(1);
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#000000").text("Summary");
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#333333")
    .text(
      [
        `Total calls: ${summaryRow.total_calls}`,
        `Total duration: ${summaryRow.total_duration}s`,
        `Average duration: ${summaryRow.average_duration.toFixed(1)}s`,
        `Inbound / Outbound: ${summaryRow.inbound_calls} / ${summaryRow.outbound_calls}`,
        `Successful / Failed: ${summaryRow.successful_calls} / ${summaryRow.failed_calls}`,
        `Total cost: $${summaryRow.total_cost.toFixed(2)}`,
      ].join("\n"),
    );

  doc.moveDown(1);
  const tableTop = doc.y + 5;
  const pageBottom = doc.page.height - PAGE_MARGIN;
  let y = tableTop;
  drawTableHeader(doc, PAGE_MARGIN, y);
  y += 18;

  let rowsWritten = 0;
  let truncated = false;

  outer: for await (const batch of callRecordRepository.iterate(filters, 500)) {
    for (const record of batch) {
      if (rowsWritten >= MAX_PDF_ROWS) {
        truncated = true;
        break outer;
      }

      if (y + ROW_HEIGHT > pageBottom) {
        doc.addPage();
        y = PAGE_MARGIN;
        drawTableHeader(doc, PAGE_MARGIN, y);
        y += 18;
      }

      let cursor = PAGE_MARGIN;
      for (const column of PDF_COLUMNS) {
        doc.fillColor("#000000").text(column.get(record), cursor, y, {
          width: column.width,
          ellipsis: true,
        });
        cursor += column.width;
      }

      y += ROW_HEIGHT;
      rowsWritten += 1;
    }
  }

  if (truncated) {
    doc.moveDown(1);
    doc
      .font("Helvetica-Oblique")
      .fontSize(8)
      .fillColor("#888888")
      .text(
        `Showing the first ${MAX_PDF_ROWS} of ${summaryRow.total_calls} matching records. Use the CSV export for the complete dataset.`,
      );
  }
}
