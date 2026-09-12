import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../../lib/prisma.js";

type DbClient = typeof prisma | Prisma.TransactionClient;

function getDbClient(db?: DbClient): DbClient {
    return db ?? prisma;
}

export async function updateUserProfile(userId: string, data: {name: string, email: string}, db?: DbClient): Promise<void> {
    await getDbClient(db).user.update({
        where: {
            id: userId,
        },
        data
    });
    return;
}