function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsvRow(fields: Array<string | number>): string {
  return fields.map((field) => escapeCsvField(String(field))).join(",") + "\r\n";
}
