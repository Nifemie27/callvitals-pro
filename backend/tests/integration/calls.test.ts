import request from "supertest";
import { Role } from "@prisma/client";
import { createApp } from "@/app";
import { disconnectDatabase } from "@/database/prisma";
import { resetDatabase } from "../helpers/db";
import {
  createTestCallRecord,
  createTestCallRecordInput,
  createTestUser,
  DEFAULT_TEST_PASSWORD,
} from "../helpers/factories";

const app = createApp();

async function loginAs(role: Role): Promise<string> {
  const email = `${role.toLowerCase()}-${Date.now()}-${Math.random()}@example.com`;
  const user = await createTestUser({ email, role });
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

describe("GET /api/calls", () => {
  it("requires authentication", async () => {
    const response = await request(app).get("/api/calls");
    expect(response.status).toBe(401);
  });

  it("returns paginated results with metadata", async () => {
    const token = await loginAs(Role.ANALYST);
    await Promise.all(Array.from({ length: 5 }, () => createTestCallRecord()));

    const response = await request(app)
      .get("/api/calls?page=1&limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.pagination).toEqual(
      expect.objectContaining({ page: 1, limit: 2, totalItems: 5, totalPages: 3 }),
    );
  });

  it("filters by city", async () => {
    const token = await loginAs(Role.ANALYST);
    await createTestCallRecord({ city: "London" });
    await createTestCallRecord({ city: "Manchester" });

    const response = await request(app)
      .get("/api/calls?city=London")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].city).toBe("London");
  });

  it("rejects an invalid direction filter with 422", async () => {
    const token = await loginAs(Role.ANALYST);
    const response = await request(app)
      .get("/api/calls?direction=SIDEWAYS")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(422);
  });
});

describe("call record RBAC", () => {
  it("allows an ADMIN to create a call record", async () => {
    const token = await loginAs(Role.ADMIN);
    const response = await request(app)
      .post("/api/calls")
      .set("Authorization", `Bearer ${token}`)
      .send(createTestCallRecordInput());

    expect(response.status).toBe(201);
    expect(response.body.data.id).toBeTruthy();
  });

  it("forbids an ANALYST from creating a call record", async () => {
    const token = await loginAs(Role.ANALYST);
    const response = await request(app)
      .post("/api/calls")
      .set("Authorization", `Bearer ${token}`)
      .send(createTestCallRecordInput());

    expect(response.status).toBe(403);
  });

  it("forbids an ANALYST from deleting a call record", async () => {
    const token = await loginAs(Role.ANALYST);
    const record = await createTestCallRecord();

    const response = await request(app)
      .delete(`/api/calls/${record.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it("allows an ADMIN to update and delete a call record", async () => {
    const token = await loginAs(Role.ADMIN);
    const record = await createTestCallRecord();

    const updateResponse = await request(app)
      .patch(`/api/calls/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ city: "Updated City" });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.city).toBe("Updated City");

    const deleteResponse = await request(app)
      .delete(`/api/calls/${record.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteResponse.status).toBe(204);

    const getResponse = await request(app)
      .get(`/api/calls/${record.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(getResponse.status).toBe(404);
  });

  it("rejects an update where endTime is before startTime", async () => {
    const token = await loginAs(Role.ADMIN);
    const record = await createTestCallRecord();

    const response = await request(app)
      .patch(`/api/calls/${record.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        startTime: "2026-01-02T00:00:00.000Z",
        endTime: "2026-01-01T00:00:00.000Z",
      });

    expect(response.status).toBe(400);
  });
});

describe("GET /api/calls/export/csv", () => {
  it("streams a CSV file with a header row and matching records", async () => {
    const token = await loginAs(Role.ADMIN);
    await createTestCallRecord({ city: "ExportCity" });

    const response = await request(app)
      .get("/api/calls/export/csv?city=ExportCity")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/csv");
    const lines = response.text.trim().split("\r\n");
    expect(lines[0]).toContain("Caller Name");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("ExportCity");
  });
});
