import { prisma } from "../../../lib/prisma.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import { NotFoundError } from "../../errors/not-found-error.js";
import type { SessionUpdateInput, UserModel } from "../../../generated/prisma/models.js";
import type { SessionModel } from "../../../generated/prisma/models.js";

type DbClient = typeof prisma | Prisma.TransactionClient;

function getDbClient(db?: DbClient): DbClient {
    return db ?? prisma;
}

export async function createSession(sessionId: string, userId: string, expireAfterTime: number, userAgent: string | null, ipAddress: string | null, refreshTokenHash: string, db?: DbClient): Promise<SessionModel> {
    const expiresAt = Date.now() + expireAfterTime;
    const session = await getDbClient(db).session.create({
        data: {
            id: sessionId,
            userId,
            expiresAt: new Date(expiresAt),
            lastUsedAt: new Date(),
            refreshTokenHash,
            userAgent: userAgent ?? null,
            ipAddress: ipAddress ?? null,
        }
    });
    return session;
}

export async function findSessionById(sessionId: string, db?: DbClient): Promise<SessionModel> {
    const session =  await getDbClient(db).session.findUnique({
        where: {
            id: sessionId,
        }
    });
    if(!session) throw new NotFoundError("Session not found");
    return session;
}

export async function deleteSession(sessionId: string, db?: DbClient): Promise<void> {
    await getDbClient(db).session.delete({
        where: {
            id: sessionId
        }
    });
    return;
}

export async function deleteAllSessionForUser(userId: string, db?: DbClient): Promise<void> {
    await getDbClient(db).session.deleteMany({
        where: {
            userId,
        }
    });
    return;
}

export async function updateSession(id: string, updateData: SessionUpdateInput, db?: DbClient): Promise<void> {
    await getDbClient(db).session.update({
        where: {
            id
        },
        data: updateData
    });
    return;
}

export async function findUserById(userId: string, db?: DbClient): Promise<UserModel> {
    const user = await getDbClient(db).user.findUnique({
        where: {
            id: userId
        }
    });
    if(!user) throw new NotFoundError("User not found");
    return user;
}

export async function findUserByEmailId(email: string, db?: DbClient): Promise<UserModel | null> {
    const user = await getDbClient(db).user.findUnique({
        where: {
            email
        }
    });
    return user;
}

export async function createUser(name: string, email: string, passwordHash: string, db?: DbClient): Promise<UserModel> {
    const user = getDbClient(db).user.create({
        data: {
            name,
            email,
            passwordHash,
        }
    });
    return user;
}

export async function findAllUserSessions(userId: string, db?: DbClient): Promise<SessionModel[]> {
    const response = await getDbClient(db).session.findMany({
        where: {
            userId,
            expiresAt: {
                gt: new Date(),
            }
        }
    });
    return response;
}
