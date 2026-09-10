import { prisma } from "../../../lib/prisma.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import { NotFoundError } from "../../errors/not-found-error.js";

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

export async function findSessionByHash(refreshTokenHash: string) {
    const session = await prisma.session.findUnique({
        where: {
            refreshTokenHash: refreshTokenHash,
        }
    });
    return session;
}

export async function findSessionById(sessionId: string, userId: string): Promise<Prisma.SessionModel> {
    const session =  await prisma.session.findUnique({
        where: {
            id: sessionId,
            userId,
        }
    });
    if(!session) throw new NotFoundError("Session not found");
    return session;
}

export async function deleteSession(sessionId: string) {
    await prisma.session.delete({
        where: {
            id: sessionId
        }
    });
}

export async function deleteAllSessionForUser(userId: string) {
    await prisma.session.deleteMany({
        where: {
            userId,
        }
    });
}

export async function updateLastUsed(sessionId: string) {
    await prisma.session.update({
        where: {
            id: sessionId,
        },
        data: {
            lastUsed: new Date(),
        }
    });
}

export async function updateSession(db: DbClient, id: string, updateData: Prisma.SessionUncheckedUpdateInput) {
    await db.session.update({
        where: {
            id
        },
        data: updateData
    });
}

export async function findUserById(userId: string): Promise<Prisma.UserModel> {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });
    if(!user) throw new NotFoundError("User not found");
    return user;
}

export async function findAllUserSessions(userId: string): Promise<Prisma.SessionModel[]> {
    const response = await prisma.session.findMany({
        where: {
            userId,
        }
    });
    return response;
}
