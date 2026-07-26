export type CallDirection = "INBOUND" | "OUTBOUND";
export type CallStatus = "SUCCESS" | "FAILED";

/** Mirrors the backend's CallRecordResponse DTO exactly, field for field. */
export interface CallRecord {
  id: string;
  callerName: string;
  callerNumber: string;
  receiverNumber: string;
  city: string;
  direction: CallDirection;
  status: CallStatus;
  durationSeconds: number;
  cost: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface CallRecordFilters {
  dateFrom?: string;
  dateTo?: string;
  caller?: string;
  receiver?: string;
  city?: string;
  direction?: CallDirection;
  status?: CallStatus;
  minDuration?: number;
  maxDuration?: number;
  search?: string;
}

export interface CallRecordListParams extends CallRecordFilters {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface CallRecordInput {
  callerName: string;
  callerNumber: string;
  receiverNumber: string;
  city: string;
  direction: CallDirection;
  status: CallStatus;
  durationSeconds: number;
  cost: number;
  startTime: string;
  endTime: string;
}
