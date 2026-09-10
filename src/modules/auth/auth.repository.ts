import { prisma } from "../../../lib/prisma.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import { NotFoundError } from "../../errors/not-found-error.js";
import type { UserModel } from "../../../generated/prisma/models.js";
import type { SessionModel } from "../../../generated/prisma/models.js";
import type { SessionUncheckedUpdateInput } from "../../../generated/prisma/models.js";

type DbClient = typeof prisma | Prisma.TransactionClient;

export async function createSession(db: DbClient, userId: string, expireAfterTime: number, userAgent: string | null, ipAddress: string | null, refreshTokenHash: string): Promise<string> {
    const expiresAt = Date.now() + expireAfterTime;
    const session = await db.session.create({
        data: {
            userId,
            expiresAt: new Date(expiresAt),
            lastUsed: new Date(),
            refreshTokenHash,
            userAgent: userAgent ?? null,
            ipAddress: ipAddress ?? null,
        }
    });
    return session.id;
}

export async function findSessionById(sessionId: string, userId: string): Promise<SessionModel> {
    const session =  await prisma.session.findUnique({
        where: {
            id: sessionId,
            userId,
        }
    });
    if(!session) throw new NotFoundError("Session not found");
    return session;
}

export async function deleteSession(sessionId: string): Promise<void> {
    await prisma.session.delete({
        where: {
            id: sessionId
        }
    });
    return;
}

export async function deleteAllSessionForUser(userId: string): Promise<void> {
    await prisma.session.deleteMany({
        where: {
            userId,
        }
    });
    return;
}

export async function updateLastUsed(sessionId: string): Promise<void> {
    await prisma.session.update({
        where: {
            id: sessionId,
        },
        data: {
            lastUsed: new Date(),
        }
    });
    return;
}

export async function updateSession(db: DbClient, id: string, updateData: SessionUncheckedUpdateInput): Promise<void> {
    await db.session.update({
        where: {
            id
        },
        data: updateData
    });
    return;
}

export async function findUserById(userId: string): Promise<UserModel> {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });
    if(!user) throw new NotFoundError("User not found");
    return user;
}

export async function findAllUserSessions(userId: string): Promise<SessionModel[]> {
    const response = await prisma.session.findMany({
        where: {
            userId,
        }
    });
    return response;
}
