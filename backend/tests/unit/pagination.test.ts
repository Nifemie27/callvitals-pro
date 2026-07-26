import { buildPaginationMeta } from "@/types/pagination";

describe("buildPaginationMeta", () => {
  it("computes totalPages and next/previous flags for a middle page", () => {
    const meta = buildPaginationMeta({ page: 2, limit: 10 }, 45);
    expect(meta).toEqual({
      page: 2,
      limit: 10,
      totalItems: 45,
      totalPages: 5,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });

  it("has no previous page on page 1", () => {
    const meta = buildPaginationMeta({ page: 1, limit: 10 }, 45);
    expect(meta.hasPreviousPage).toBe(false);
    expect(meta.hasNextPage).toBe(true);
  });

  it("has no next page on the last page", () => {
    const meta = buildPaginationMeta({ page: 5, limit: 10 }, 45);
    expect(meta.hasNextPage).toBe(false);
  });

  it("reports at least 1 total page when there are zero items", () => {
    const meta = buildPaginationMeta({ page: 1, limit: 10 }, 0);
    expect(meta.totalPages).toBe(1);
    expect(meta.hasNextPage).toBe(false);
  });
});
