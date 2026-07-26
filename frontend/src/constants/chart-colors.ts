/**
 * Every chart in this dashboard is a single-series magnitude/trend chart, so
 * they all share one accent (the sequential blue also used for interactive
 * UI). "Other" buckets (long-tail groupings) get a separate muted tone so
 * they read as an aggregate, not a ranked entity.
 *
 * The series/Other pairing intentionally fails a categorical-palette CVD
 * check (validated with the dataviz skill's validator) — the gray is
 * deliberately low-chroma, since it's not a peer category competing for hue
 * identity. That's only safe because the bar carries a direct text label
 * ("Other (N)") rather than relying on color alone, which is the validator's
 * documented exception for this exact case.
 */
export const CHART_SERIES_COLOR = "var(--chart-1)";
export const CHART_OTHER_COLOR = "var(--chart-5)";
