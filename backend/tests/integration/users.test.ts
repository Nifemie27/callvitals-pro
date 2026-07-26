import request from "supertest";
import { Role, type User } from "@prisma/client";
import { createApp } from "@/app";
import { disconnectDatabase } from "@/database/prisma";
import { resetDatabase } from "../helpers/db";
import { createTestUser, DEFAULT_TEST_PASSWORD } from "../helpers/factories";

const app = createApp();

async function loginAndGetToken(
  role: Role,
  email?: string,
): Promise<{ user: User; token: string }> {
  const user = await createTestUser({
    email: email ?? `${role.toLowerCase()}-${Date.now()}-${Math.random()}@example.com`,
    role,
  });
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email: user.email, password: DEFAULT_TEST_PASSWORD });
  return { user, token: response.body.data.accessToken as string };
}

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await disconnectDatabase();
});

describe("GET /api/users", () => {
  it("forbids a non-admin from listing users", async () => {
    const { token } = await loginAndGetToken(Role.ANALYST);
    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(403);
  });

  it("allows an admin to list users", async () => {
    const { token } = await loginAndGetToken(Role.ADMIN);
    await createTestUser({ role: Role.ANALYST });

    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(2);
  });
});

describe("PATCH /api/users/:id", () => {
  it("allows an admin to promote another user to ADMIN", async () => {
    const { token } = await loginAndGetToken(Role.ADMIN);
    const target = await createTestUser({ role: Role.ANALYST });

    const response = await request(app)
      .patch(`/api/users/${target.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: Role.ADMIN });

    expect(response.status).toBe(200);
    expect(response.body.data.role).toBe(Role.ADMIN);
  });

  it("prevents an admin from changing their own role", async () => {
    const { token, user } = await loginAndGetToken(Role.ADMIN);

    const response = await request(app)
      .patch(`/api/users/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: Role.ANALYST });

    expect(response.status).toBe(400);
  });

  it("deactivating a user revokes their ability to log in again", async () => {
    const { token } = await loginAndGetToken(Role.ADMIN);
    const target = await createTestUser({ role: Role.ANALYST });

    const patchResponse = await request(app)
      .patch(`/api/users/${target.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ isActive: false });
    expect(patchResponse.status).toBe(200);

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: target.email, password: DEFAULT_TEST_PASSWORD });
    expect(loginResponse.status).toBe(403);
  });
});

describe("DELETE /api/users/:id", () => {
  it("prevents an admin from deleting their own account", async () => {
    const { token, user } = await loginAndGetToken(Role.ADMIN);
    const response = await request(app)
      .delete(`/api/users/${user.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(400);
  });

  it("allows an admin to delete another user", async () => {
    const { token } = await loginAndGetToken(Role.ADMIN);
    const target = await createTestUser({ role: Role.ANALYST });

    const response = await request(app)
      .delete(`/api/users/${target.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(204);
  });
});
