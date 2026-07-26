export interface SummaryResponse {
  totalCalls: number;
  totalDuration: number;
  averageDuration: number;
  incomingCalls: number;
  outgoingCalls: number;
  successfulCalls: number;
  failedCalls: number;
  successRate: number;
  totalCost: number;
}

export interface TopCallerResponse {
  callerNumber: string;
  callerName: string;
  callCount: number;
  totalDuration: number;
  totalCost: number;
}

export interface CallDistributionResponse {
  byDirection: {
    inbound: number;
    outbound: number;
    inboundPercent: number;
    outboundPercent: number;
  };
  byStatus: {
    successful: number;
    failed: number;
    successRate: number;
    failureRate: number;
  };
}

export interface CallsPerDayEntry {
  date: string;
  callCount: number;
  totalDuration: number;
}

export interface CallsPerCityEntry {
  city: string;
  callCount: number;
  totalCost: number;
  percentOfTotal: number;
}

export interface CallsPerCityResponse {
  top: CallsPerCityEntry[];
  other: { callCount: number; totalCost: number; percentOfTotal: number } | null;
  totalDistinctCities: number;
}

export interface PeriodStats {
  from: string;
  to: string;
  totalCalls: number;
  totalDuration: number;
}

export interface TrendsResponse {
  currentPeriod: PeriodStats;
  previousPeriod: PeriodStats;
  changePercent: {
    calls: number;
    duration: number;
  };
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export { round };
