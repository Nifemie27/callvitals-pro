import { once } from "node:events";
import type { Request, Response } from "express";
import PDFDocument from "pdfkit";
import { AuditAction } from "@prisma/client";
import { parseCallFilters } from "@/utils/queryParsing";
import {
  streamCallsCsv,
  writeCallsPdfReport,
  PDF_PAGE_MARGIN,
} from "@/services/export.service";
import { auditService, actorFromRequest } from "@/services/audit.service";

function timestampSuffix(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export async function exportCsv(req: Request, res: Response): Promise<void> {
  const filters = parseCallFilters(req.query);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="call-records-${timestampSuffix()}.csv"`,
  );

  for await (const chunk of streamCallsCsv(filters)) {
    if (!res.write(chunk)) {
      await once(res, "drain");
    }
  }
  res.end();

  await auditService.record(
    AuditAction.CALLS_EXPORTED_CSV,
    actorFromRequest(req, req.user?.id),
    {
      entityType: "CallRecord",
      metadata: { filters },
    },
  );
}

export async function exportPdf(req: Request, res: Response): Promise<void> {
  const filters = parseCallFilters(req.query);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="call-records-${timestampSuffix()}.pdf"`,
  );

  const doc = new PDFDocument({
    margin: PDF_PAGE_MARGIN,
    size: "A4",
    layout: "landscape",
  });
  doc.pipe(res);

  await writeCallsPdfReport(doc, filters, {
    title: "CallVitals Call Records Report",
    appliedFilters: filters as Record<string, unknown>,
  });

  doc.end();

  await auditService.record(
    AuditAction.CALLS_EXPORTED_PDF,
    actorFromRequest(req, req.user?.id),
    {
      entityType: "CallRecord",
      metadata: { filters },
    },
  );
}
