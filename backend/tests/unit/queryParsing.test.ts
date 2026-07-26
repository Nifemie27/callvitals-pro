import {
  parseCallFilters,
  parseCallSort,
  parsePagination,
  parsePositiveInt,
} from "@/utils/queryParsing";

describe("parsePagination", () => {
  it("defaults to page 1, limit 20 when nothing is provided", () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 20 });
  });

  it("caps limit at 100 even if a larger value is requested", () => {
    expect(parsePagination({ limit: "500" })).toEqual({
      page: 1,
      limit: 100,
    });
  });

  it("falls back to defaults on invalid (non-numeric, negative) input", () => {
    expect(parsePagination({ page: "-5", limit: "abc" })).toEqual({
      page: 1,
      limit: 20,
    });
  });
});

describe("parseCallSort", () => {
  it("defaults to startTime descending", () => {
    expect(parseCallSort({})).toEqual({ field: "startTime", direction: "desc" });
  });

  it("parses a valid field:direction pair", () => {
    expect(parseCallSort({ sort: "cost:asc" })).toEqual({
      field: "cost",
      direction: "asc",
    });
  });

  it("falls back to startTime for an unknown field rather than throwing", () => {
    expect(parseCallSort({ sort: "notAField:asc" })).toEqual({
      field: "startTime",
      direction: "asc",
    });
  });
});

describe("parseCallFilters", () => {
  it("returns an empty object when no filters are present", () => {
    expect(parseCallFilters({})).toEqual({});
  });

  it("parses direction and status case-insensitively", () => {
    const filters = parseCallFilters({
      direction: "inbound",
      status: "success",
    });
    expect(filters.direction).toBe("INBOUND");
    expect(filters.status).toBe("SUCCESS");
  });

  it("silently drops an invalid enum value instead of throwing", () => {
    const filters = parseCallFilters({ direction: "SIDEWAYS" });
    expect(filters.direction).toBeUndefined();
  });

  it("silently drops an invalid date instead of throwing", () => {
    const filters = parseCallFilters({ dateFrom: "not-a-date" });
    expect(filters.dateFrom).toBeUndefined();
  });

  it("parses a valid date range", () => {
    const filters = parseCallFilters({
      dateFrom: "2026-01-01",
      dateTo: "2026-01-31",
    });
    expect(filters.dateFrom?.toISOString().slice(0, 10)).toBe("2026-01-01");
    expect(filters.dateTo?.toISOString().slice(0, 10)).toBe("2026-01-31");
  });
});

describe("parsePositiveInt", () => {
  it("returns the fallback for missing or non-positive values", () => {
    expect(parsePositiveInt(undefined, 10)).toBe(10);
    expect(parsePositiveInt("-3", 10)).toBe(10);
    expect(parsePositiveInt("0", 10)).toBe(10);
  });

  it("clamps to the provided max", () => {
    expect(parsePositiveInt("999", 10, 50)).toBe(50);
  });

  it("floors non-integer values", () => {
    expect(parsePositiveInt("4.9", 10)).toBe(4);
  });
});
