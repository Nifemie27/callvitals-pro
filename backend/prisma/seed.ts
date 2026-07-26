import { PrismaClient, Prisma, Role, CallDirection, CallStatus } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

interface RawCallRecord {
  id: string;
  callerName: string;
  callerNumber: string;
  receiverNumber: string;
  city: string;
  callDirection: boolean;
  callStatus: boolean;
  callDuration: number;
  callCost: string;
  callStartTime: string;
  callEndTime: string;
}

const BATCH_SIZE = 1000;

async function seedUsers(): Promise<void> {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!Change";
  const analystPassword = process.env.SEED_ANALYST_PASSWORD ?? "Analyst123!Change";

  const [adminHash, analystHash] = await Promise.all([
    hashPassword(adminPassword),
    hashPassword(analystPassword),
  ]);

  await prisma.user.upsert({
    where: { email: "admin@callvitals.dev" },
    update: {},
    create: {
      email: "admin@callvitals.dev",
      passwordHash: adminHash,
      name: "Platform Admin",
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "analyst@callvitals.dev" },
    update: {},
    create: {
      email: "analyst@callvitals.dev",
      passwordHash: analystHash,
      name: "Data Analyst",
      role: Role.ANALYST,
    },
  });

  console.log("Seeded users:");
  console.log("  admin@callvitals.dev   / (SEED_ADMIN_PASSWORD or default)");
  console.log("  analyst@callvitals.dev / (SEED_ANALYST_PASSWORD or default)");
}

function mapCallRecord(raw: RawCallRecord): Prisma.CallRecordCreateManyInput {
  return {
    callerName: raw.callerName,
    callerNumber: raw.callerNumber,
    receiverNumber: raw.receiverNumber,
    city: raw.city,
    direction: raw.callDirection ? CallDirection.INBOUND : CallDirection.OUTBOUND,
    status: raw.callStatus ? CallStatus.SUCCESS : CallStatus.FAILED,
    durationSeconds: raw.callDuration,
    cost: new Prisma.Decimal(raw.callCost),
    startTime: new Date(raw.callStartTime),
    endTime: new Date(raw.callEndTime),
  };
}

async function seedCallRecords(): Promise<void> {
  const existing = await prisma.callRecord.count();
  if (existing > 0) {
    console.log(`Call records already seeded (${existing} rows), skipping.`);
    console.log("Run with SEED_FORCE=1 to wipe and reseed.");
    if (process.env.SEED_FORCE !== "1") return;
    await prisma.callRecord.deleteMany();
    console.log("Cleared existing call records (SEED_FORCE=1).");
  }

  const dataPath = join(__dirname, "seed-data", "call-records.json");
  const raw = JSON.parse(readFileSync(dataPath, "utf-8")) as RawCallRecord[];
  const records = raw.map(mapCallRecord);

  let inserted = 0;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await prisma.callRecord.createMany({ data: batch });
    inserted += batch.length;
    console.log(`  inserted ${inserted}/${records.length}`);
  }

  console.log(`Seeded ${inserted} call records.`);
}

async function main(): Promise<void> {
  await seedUsers();
  await seedCallRecords();
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
