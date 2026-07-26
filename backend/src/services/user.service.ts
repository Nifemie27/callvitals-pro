import type { ParsedQs } from "qs";
import { AuditAction, Role } from "@prisma/client";
import { userRepository, type SafeUser } from "@/repositories/user.repository";
import { refreshTokenRepository } from "@/repositories/refreshToken.repository";
import { BadRequestError, NotFoundError } from "@/errors/AppError";
import { buildPaginationMeta, type PaginationMeta } from "@/types/pagination";
import { parsePagination } from "@/utils/queryParsing";
import type { AuditActor } from "@/services/audit.service";
import { auditService } from "@/services/audit.service";
import type { UpdateUserBody } from "@/dto/user.dto";

class UserService {
  async list(
    query: ParsedQs,
  ): Promise<{ items: SafeUser[]; pagination: PaginationMeta }> {
    const pagination = parsePagination(query);
    const search = typeof query.search === "string" ? query.search : undefined;
    const role =
      typeof query.role === "string" && query.role in Role
        ? (query.role as Role)
        : undefined;

    const { items, total } = await userRepository.list({ ...pagination, search, role });
    return { items, pagination: buildPaginationMeta(pagination, total) };
  }

  async getById(id: string): Promise<SafeUser> {
    const user = await userRepository.findSafeById(id);
    if (!user) throw new NotFoundError("User");
    return user;
  }

  async update(id: string, input: UpdateUserBody, actor: AuditActor): Promise<SafeUser> {
    const existing = await userRepository.findById(id);
    if (!existing) throw new NotFoundError("User");

    if (input.role && input.role !== existing.role) {
      if (actor.userId === id) {
        throw new BadRequestError("You cannot change your own role");
      }
      await userRepository.updateRole(id, input.role);
      await auditService.record(AuditAction.USER_ROLE_CHANGED, actor, {
        entityType: "User",
        entityId: id,
        metadata: { from: existing.role, to: input.role },
      });
    }

    if (input.isActive !== undefined && input.isActive !== existing.isActive) {
      if (actor.userId === id && !input.isActive) {
        throw new BadRequestError("You cannot deactivate your own account");
      }
      await userRepository.setActive(id, input.isActive);
      if (!input.isActive) {
        await refreshTokenRepository.revokeAllForUser(id);
        await auditService.record(AuditAction.USER_DEACTIVATED, actor, {
          entityType: "User",
          entityId: id,
        });
      }
    }

    const updated = await userRepository.findSafeById(id);
    if (!updated) throw new NotFoundError("User");
    return updated;
  }

  async delete(id: string, actor: AuditActor): Promise<void> {
    if (actor.userId === id) {
      throw new BadRequestError("You cannot delete your own account");
    }
    const existing = await userRepository.findById(id);
    if (!existing) throw new NotFoundError("User");

    await userRepository.delete(id);
    await auditService.record(AuditAction.USER_DELETED, actor, {
      entityType: "User",
      entityId: id,
    });
  }
}

export const userService = new UserService();
