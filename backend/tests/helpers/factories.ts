import { CallDirection, CallStatus, Role } from "@prisma/client";
import type { CallRecord, User } from "@prisma/client";
import { prisma } from "@/database/prisma";
import { hashPassword } from "@/utils/password";

export const DEFAULT_TEST_PASSWORD = "TestPass123";

export async function createTestUser(
  overrides: { email?: string; role?: Role; isActive?: boolean } = {},
): Promise<User> {
  const passwordHash = await hashPassword(DEFAULT_TEST_PASSWORD);
  return prisma.user.create({
    data: {
      email: overrides.email ?? `user-${Date.now()}-${Math.random()}@example.com`,
      passwordHash,
      name: "Test User",
      role: overrides.role ?? Role.ANALYST,
      isActive: overrides.isActive ?? true,
    },
  });
}

let sequence = 0;

interface TestCallRecordInput {
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
  [key: string]: unknown;
}

export function createTestCallRecordInput(
  overrides: Record<string, unknown> = {},
): TestCallRecordInput {
  sequence += 1;
  const startTime = new Date(Date.now() - sequence * 60_000);
  const endTime = new Date(startTime.getTime() + 60_000);

  return {
    callerName: `Test Caller ${sequence}`,
    callerNumber: `0700000${String(sequence).padStart(4, "0")}`,
    receiverNumber: `0711111${String(sequence).padStart(4, "0")}`,
    city: "Testville",
    direction: CallDirection.OUTBOUND,
    status: CallStatus.SUCCESS,
    durationSeconds: 60,
    cost: 5.5,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    ...overrides,
  };
}

export async function createTestCallRecord(
  overrides: Record<string, unknown> = {},
): Promise<CallRecord> {
  const input = createTestCallRecordInput(overrides);
  return prisma.callRecord.create({
    data: {
      ...input,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
    },
  });
}
