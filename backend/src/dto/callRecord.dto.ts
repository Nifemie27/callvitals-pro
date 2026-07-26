import type { CallDirection, CallRecord, CallStatus } from "@prisma/client";

export interface CallRecordResponse {
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

export function toCallRecordResponse(record: CallRecord): CallRecordResponse {
  return {
    id: record.id,
    callerName: record.callerName,
    callerNumber: record.callerNumber,
    receiverNumber: record.receiverNumber,
    city: record.city,
    direction: record.direction,
    status: record.status,
    durationSeconds: record.durationSeconds,
    cost: Number(record.cost),
    startTime: record.startTime.toISOString(),
    endTime: record.endTime.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export interface CreateCallRecordBody {
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

export type UpdateCallRecordBody = Partial<CreateCallRecordBody>;
