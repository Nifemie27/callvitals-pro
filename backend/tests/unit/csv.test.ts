import { toCsvRow } from "@/utils/csv";

describe("toCsvRow", () => {
  it("joins fields with commas and ends with CRLF", () => {
    expect(toCsvRow(["a", "b", 1])).toBe("a,b,1\r\n");
  });

  it("quotes a field containing a comma", () => {
    expect(toCsvRow(["North Claire, UK"])).toBe('"North Claire, UK"\r\n');
  });

  it("quotes and escapes a field containing a double quote", () => {
    expect(toCsvRow(['Say "hi"'])).toBe('"Say ""hi"""\r\n');
  });

  it("quotes a field containing a newline", () => {
    expect(toCsvRow(["line1\nline2"])).toBe('"line1\nline2"\r\n');
  });

  it("leaves a plain field unquoted", () => {
    expect(toCsvRow(["07387416172"])).toBe("07387416172\r\n");
  });
});
