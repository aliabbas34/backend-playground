import { Role } from "../../../generated/prisma/enums.js";
import { prisma } from "../../../lib/prisma.js";

interface UserData {
    id: string,
    name: string,
    email: string,
    role: Role,
    createdAt: Date,
    updatedAt: Date,
}

class AdminService{
    public async listUsers(): Promise<UserData[]>{
        const users = await prisma.user.findMany({// move this to admin.repository.ts
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        return users;
    }
    public async updateUserRole(userId: string, newRole: Role): Promise<void> {
        await prisma.user.update({// move this to admin.repository.ts
            where: {
                id: userId,
            },
            data: {
                role: newRole,
            }
        });
    }
}

export const adminService = new AdminService();