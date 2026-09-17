import { Prisma, Role, User } from "../../../generated/prisma/client.js";
import { prisma } from "../../../lib/prisma.js";

type DbClient = typeof prisma | Prisma.TransactionClient;
export type UserFilterParams= {
    skip: number,
    take: number,
    search?: string,
    role?: Role,
}
export type PublicUser = Pick<User, "id" | "name" | "email" | "role" | "createdAt" | "updatedAt">;
interface PaginatedResult<T> {
    data: T[],
    total: number,
}

class UserRepository {
    constructor(private db: DbClient = prisma) {};

    public async updateUserProfile(userId: string, data:{name: string, email: string}, db: DbClient = this.db): Promise<void> {
        await db.user.update({
            where: {
                id: userId,
            },
            data
        });
        return;
    }
    public async findManyWithFilters(params: UserFilterParams, db: DbClient = this.db): Promise<PaginatedResult<PublicUser>>{
        const { search, role, skip, take } = params;

        // Dynamically build the `where` clause
        const where: Prisma.UserWhereInput = {};

        if (role) {
            where.role = role;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await db.$transaction([
            db.user.findMany({
                where,
                skip,
                take,
                orderBy: {
                    createdAt: 'desc',
                },
                select:{
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                }
            }),
            db.user.count({where})
        ]);
        return { data, total };
    }
}

export const userRepository = new UserRepository();