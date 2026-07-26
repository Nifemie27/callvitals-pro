import request from "supertest";
import { createApp } from "@/app";
import { resetDatabase } from "../helpers/db";
import { createTestUser, DEFAULT_TEST_PASSWORD } from "../helpers/factories";
import { disconnectDatabase } from "@/database/prisma";

const app = createApp();

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await disconnectDatabase();
});

describe("POST /api/auth/register", () => {
  it("creates a new ANALYST-role account and returns tokens", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "newuser@example.com",
      password: "StrongPass1",
      name: "New User",
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.role).toBe("ANALYST");
    expect(response.body.data.accessToken).toBeTruthy();
    expect(response.headers["set-cookie"]?.[0]).toMatch(/refreshToken=/);
  });

  it("rejects a weak password with 422", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "weak@example.com",
      password: "weak",
      name: "Weak Password",
    });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });

  it("rejects registering with an email already in use", async () => {
    await createTestUser({ email: "taken@example.com" });

    const response = await request(app).post("/api/auth/register").send({
      email: "taken@example.com",
      password: "StrongPass1",
      name: "Duplicate",
    });

    expect(response.status).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with valid credentials", async () => {
    const user = await createTestUser({ email: "login@example.com" });

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: DEFAULT_TEST_PASSWORD });

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe(user.email);
  });

  it("rejects an incorrect password with 401", async () => {
    const user = await createTestUser({ email: "login2@example.com" });

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "WrongPassword1" });

    expect(response.status).toBe(401);
  });
});

describe("auth session lifecycle", () => {
  it("supports login -> me -> refresh -> logout end to end", async () => {
    const user = await createTestUser({ email: "lifecycle@example.com" });
    const agent = request.agent(app);

    const loginResponse = await agent
      .post("/api/auth/login")
      .send({ email: user.email, password: DEFAULT_TEST_PASSWORD });
    expect(loginResponse.status).toBe(200);
    const accessToken = loginResponse.body.data.accessToken;

    const meResponse = await agent
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(meResponse.status).toBe(200);
    expect(meResponse.body.data.email).toBe(user.email);

    const refreshResponse = await agent.post("/api/auth/refresh");
    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.data.accessToken).toBeTruthy();

    const logoutResponse = await agent.post("/api/auth/logout");
    expect(logoutResponse.status).toBe(200);

    const secondRefresh = await agent.post("/api/auth/refresh");
    expect(secondRefresh.status).toBe(401);
  });

  it("rejects /me without an access token", async () => {
    const response = await request(app).get("/api/auth/me");
    expect(response.status).toBe(401);
  });
});
