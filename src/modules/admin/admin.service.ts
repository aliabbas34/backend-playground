import { Prisma } from "../../../generated/prisma/client.js";
import { Role } from "../../../generated/prisma/enums.js";
import { prisma } from "../../../lib/prisma.js";
import { NotFoundError } from "../../errors/not-found-error.js";

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
        const users = await prisma.user.findMany({
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
        try {
            await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    role: newRole,
                }
            });
            return;
        } catch(error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError){
                if(error.code==='P2025'){
                    throw new NotFoundError("user not found")
                }
            }
            throw error;
        }
        
    }
}

export const adminService = new AdminService();