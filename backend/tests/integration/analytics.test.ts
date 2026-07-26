import request from "supertest";
import { CallDirection, CallStatus, Role } from "@prisma/client";
import { createApp } from "@/app";
import { disconnectDatabase } from "@/database/prisma";
import { resetDatabase } from "../helpers/db";
import {
  createTestCallRecord,
  createTestUser,
  DEFAULT_TEST_PASSWORD,
} from "../helpers/factories";

const app = createApp();

async function loginAsAnalyst(): Promise<string> {
  const email = `analyst-${Date.now()}-${Math.random()}@example.com`;
  const user = await createTestUser({ email, role: Role.ANALYST });
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email: user.email, password: DEFAULT_TEST_PASSWORD });
  return response.body.data.accessToken as string;
}

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await disconnectDatabase();
});

describe("GET /api/analytics/summary", () => {
  it("computes totals across inbound/outbound and success/failed calls", async () => {
    const token = await loginAsAnalyst();
    await createTestCallRecord({
      direction: CallDirection.INBOUND,
      status: CallStatus.SUCCESS,
      durationSeconds: 100,
      cost: 10,
    });
    await createTestCallRecord({
      direction: CallDirection.OUTBOUND,
      status: CallStatus.FAILED,
      durationSeconds: 50,
      cost: 5,
    });

    const response = await request(app)
      .get("/api/analytics/summary")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        totalCalls: 2,
        totalDuration: 150,
        incomingCalls: 1,
        outgoingCalls: 1,
        successfulCalls: 1,
        failedCalls: 1,
        successRate: 50,
        totalCost: 15,
      }),
    );
  });

  it("analysts can view analytics (read-only role still has access)", async () => {
    const token = await loginAsAnalyst();
    const response = await request(app)
      .get("/api/analytics/summary")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
  });
});

describe("GET /api/analytics/top-callers", () => {
  it("ranks callers by call count", async () => {
    const token = await loginAsAnalyst();
    await createTestCallRecord({ callerNumber: "0700000001" });
    await createTestCallRecord({ callerNumber: "0700000001" });
    await createTestCallRecord({ callerNumber: "0700000002" });

    const response = await request(app)
      .get("/api/analytics/top-callers")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toEqual(
      expect.objectContaining({ callerNumber: "0700000001", callCount: 2 }),
    );
  });
});

describe("GET /api/analytics/calls-per-city", () => {
  it("sorts by call count by default, and by total cost when sortBy=cost", async () => {
    const token = await loginAsAnalyst();
    // City A: more calls, lower total cost. City B: fewer calls, higher total cost.
    await createTestCallRecord({ city: "CityA", cost: 1 });
    await createTestCallRecord({ city: "CityA", cost: 1 });
    await createTestCallRecord({ city: "CityA", cost: 1 });
    await createTestCallRecord({ city: "CityB", cost: 100 });

    const byCount = await request(app)
      .get("/api/analytics/calls-per-city")
      .set("Authorization", `Bearer ${token}`);
    expect(byCount.body.data.top[0].city).toBe("CityA");

    const byCost = await request(app)
      .get("/api/analytics/calls-per-city?sortBy=cost")
      .set("Authorization", `Bearer ${token}`);
    expect(byCost.body.data.top[0].city).toBe("CityB");
  });
});

describe("GET /api/analytics/call-distribution", () => {
  it("returns direction and status percentage breakdowns", async () => {
    const token = await loginAsAnalyst();
    await createTestCallRecord({
      direction: CallDirection.INBOUND,
      status: CallStatus.SUCCESS,
    });
    await createTestCallRecord({
      direction: CallDirection.INBOUND,
      status: CallStatus.SUCCESS,
    });
    await createTestCallRecord({
      direction: CallDirection.OUTBOUND,
      status: CallStatus.FAILED,
    });
    await createTestCallRecord({
      direction: CallDirection.OUTBOUND,
      status: CallStatus.FAILED,
    });

    const response = await request(app)
      .get("/api/analytics/call-distribution")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.byDirection.inboundPercent).toBe(50);
    expect(response.body.data.byStatus.successRate).toBe(50);
  });
});

describe("GET /api/analytics/trends", () => {
  it("anchors the default window to the data's latest record, not wall-clock time", async () => {
    const token = await loginAsAnalyst();

    // The most recent record is far in the past relative to "now" (this
    // test's real execution time) - if trends anchored to wall-clock time,
    // the current 30-day period would contain zero of these calls.
    const latest = new Date("2020-01-15T00:00:00.000Z");
    await createTestCallRecord({
      startTime: latest,
      endTime: new Date(latest.getTime() + 60_000),
    });
    await createTestCallRecord({
      startTime: new Date("2020-01-10T00:00:00.000Z"),
      endTime: new Date("2020-01-10T00:01:00.000Z"),
    });

    const response = await request(app)
      .get("/api/analytics/trends")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.currentPeriod.totalCalls).toBeGreaterThan(0);
    expect(new Date(response.body.data.currentPeriod.to).getTime()).toBe(
      latest.getTime(),
    );
  });
});
