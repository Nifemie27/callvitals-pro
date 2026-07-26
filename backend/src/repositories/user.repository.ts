import type { Prisma, Role, User } from "@prisma/client";
import { prisma } from "@/database/prisma";

export type SafeUser = Omit<User, "passwordHash">;

const SAFE_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

class UserRepository {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  findSafeById(id: string): Promise<SafeUser | null> {
    return prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
  }

  create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role?: Role;
  }): Promise<User> {
    return prisma.user.create({ data });
  }

  async list(params: {
    page: number;
    limit: number;
    search?: string;
    role?: Role;
  }): Promise<{ items: SafeUser[]; total: number }> {
    const where: Prisma.UserWhereInput = {
      ...(params.role ? { role: params.role } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" } },
              { email: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: SAFE_SELECT,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  updateRole(id: string, role: Role): Promise<SafeUser> {
    return prisma.user.update({ where: { id }, data: { role }, select: SAFE_SELECT });
  }

  setActive(id: string, isActive: boolean): Promise<SafeUser> {
    return prisma.user.update({ where: { id }, data: { isActive }, select: SAFE_SELECT });
  }

  delete(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } });
  }
}

export const userRepository = new UserRepository();
