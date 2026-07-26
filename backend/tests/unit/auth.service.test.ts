import { Role } from "@prisma/client";
import { hashPassword } from "@/utils/password";
import { ConflictError, ForbiddenError, UnauthorizedError } from "@/errors/AppError";

jest.mock("@/repositories/user.repository");
jest.mock("@/repositories/refreshToken.repository");
jest.mock("@/services/audit.service", () => ({
  auditService: { record: jest.fn().mockResolvedValue(undefined) },
  actorFromRequest: jest.fn(),
}));

import { userRepository } from "@/repositories/user.repository";
import { refreshTokenRepository } from "@/repositories/refreshToken.repository";
import { auditService } from "@/services/audit.service";
import { authService } from "@/services/auth.service";

const mockedUserRepo = jest.mocked(userRepository);
const mockedRefreshTokenRepo = jest.mocked(refreshTokenRepository);
const mockedAudit = jest.mocked(auditService);

const context = { ipAddress: "127.0.0.1", userAgent: "jest" };

interface TestUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  passwordHash: string;
}

function buildUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    id: "user-1",
    email: "user@example.com",
    name: "Test User",
    role: Role.ANALYST,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordHash: "",
    ...overrides,
  };
}

describe("authService.login", () => {
  it("issues tokens and records USER_LOGIN on valid credentials", async () => {
    const passwordHash = await hashPassword("CorrectPass1");
    const user = buildUser({ passwordHash });
    mockedUserRepo.findByEmail.mockResolvedValue(user);
    mockedRefreshTokenRepo.create.mockResolvedValue({} as never);

    const result = await authService.login(
      { email: user.email, password: "CorrectPass1" },
      context,
    );

    expect(result.user.id).toBe(user.id);
    expect(result.tokens.accessToken).toBeTruthy();
    expect(mockedAudit.record).toHaveBeenCalledWith(
      "USER_LOGIN",
      expect.objectContaining({ userId: user.id }),
      expect.anything(),
    );
  });

  it("throws UnauthorizedError and records USER_LOGIN_FAILED on wrong password", async () => {
    const passwordHash = await hashPassword("CorrectPass1");
    const user = buildUser({ passwordHash });
    mockedUserRepo.findByEmail.mockResolvedValue(user);

    await expect(
      authService.login({ email: user.email, password: "WrongPass1" }, context),
    ).rejects.toThrow(UnauthorizedError);

    expect(mockedAudit.record).toHaveBeenCalledWith(
      "USER_LOGIN_FAILED",
      expect.objectContaining({ userId: user.id }),
    );
  });

  it("throws UnauthorizedError when the user does not exist", async () => {
    mockedUserRepo.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({ email: "nobody@example.com", password: "whatever1" }, context),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("throws ForbiddenError when the account is deactivated", async () => {
    const passwordHash = await hashPassword("CorrectPass1");
    const user = buildUser({ passwordHash, isActive: false });
    mockedUserRepo.findByEmail.mockResolvedValue(user);

    await expect(
      authService.login({ email: user.email, password: "CorrectPass1" }, context),
    ).rejects.toThrow(ForbiddenError);
  });
});

describe("authService.register", () => {
  it("throws ConflictError if the email is already taken", async () => {
    mockedUserRepo.findByEmail.mockResolvedValue(buildUser());

    await expect(
      authService.register(
        { email: "user@example.com", password: "NewPass123", name: "New" },
        context,
      ),
    ).rejects.toThrow(ConflictError);
  });

  it("creates an ANALYST-role user and issues tokens on success", async () => {
    mockedUserRepo.findByEmail.mockResolvedValue(null);
    const created = buildUser({ id: "new-user", role: Role.ANALYST });
    mockedUserRepo.create.mockResolvedValue(created);
    mockedRefreshTokenRepo.create.mockResolvedValue({} as never);

    const result = await authService.register(
      { email: "new@example.com", password: "NewPass123", name: "New" },
      context,
    );

    expect(mockedUserRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: Role.ANALYST }),
    );
    expect(result.user.id).toBe("new-user");
    expect(result.tokens.accessToken).toBeTruthy();
  });
});

describe("authService.refresh", () => {
  it("rotates the token and returns a new pair for a valid token", async () => {
    const user = buildUser();
    mockedRefreshTokenRepo.findByHash.mockResolvedValue({
      id: "token-1",
      userId: user.id,
      user,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    } as never);
    mockedRefreshTokenRepo.create.mockResolvedValue({} as never);
    mockedRefreshTokenRepo.revoke.mockResolvedValue(undefined);

    const result = await authService.refresh("raw-token", context);

    expect(result.user.id).toBe(user.id);
    expect(mockedRefreshTokenRepo.revoke).toHaveBeenCalledWith("token-1");
  });

  it("throws UnauthorizedError for an unknown token", async () => {
    mockedRefreshTokenRepo.findByHash.mockResolvedValue(null);
    await expect(authService.refresh("unknown", context)).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it("revokes all sessions and throws when a revoked token is reused", async () => {
    const user = buildUser();
    mockedRefreshTokenRepo.findByHash.mockResolvedValue({
      id: "token-1",
      userId: user.id,
      user,
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    } as never);
    mockedRefreshTokenRepo.revokeAllForUser.mockResolvedValue(undefined);

    await expect(authService.refresh("stolen-token", context)).rejects.toThrow(
      UnauthorizedError,
    );
    expect(mockedRefreshTokenRepo.revokeAllForUser).toHaveBeenCalledWith(user.id);
  });

  it("throws UnauthorizedError for an expired token", async () => {
    const user = buildUser();
    mockedRefreshTokenRepo.findByHash.mockResolvedValue({
      id: "token-1",
      userId: user.id,
      user,
      revokedAt: null,
      expiresAt: new Date(Date.now() - 1000),
    } as never);

    await expect(authService.refresh("expired", context)).rejects.toThrow(
      UnauthorizedError,
    );
  });
});

describe("authService.logout", () => {
  it("revokes the token when it is found", async () => {
    mockedRefreshTokenRepo.findValidByHash.mockResolvedValue({
      id: "token-1",
      userId: "user-1",
    } as never);
    mockedRefreshTokenRepo.revoke.mockResolvedValue(undefined);

    await authService.logout("raw-token", context);

    expect(mockedRefreshTokenRepo.revoke).toHaveBeenCalledWith("token-1");
  });

  it("does nothing when the token is not found", async () => {
    mockedRefreshTokenRepo.findValidByHash.mockResolvedValue(null);
    await authService.logout("missing", context);
    expect(mockedRefreshTokenRepo.revoke).not.toHaveBeenCalled();
  });
});
