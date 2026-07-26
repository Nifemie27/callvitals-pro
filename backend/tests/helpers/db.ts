import { prisma } from "@/database/prisma";

/** Wipes every table between tests so integration tests don't leak state into each other. */
export async function resetDatabase(): Promise<void> {
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.callRecord.deleteMany();
  await prisma.user.deleteMany();
}
