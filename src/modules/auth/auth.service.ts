import { prisma } from "../../../lib/prisma.js";
import bcrypt from "bcrypt";
import { ConflictError } from "../../errors/conflict-error.js";
import { NotFoundError } from "../../errors/not-found-error.js";
import { UnauthorizedError } from "../../errors/unauthorized-error.js";
import { tokenService } from "./token.service.js";
import { createSession, createUser, deleteAllSessionForUser, deleteSession, findAllUserSessions, findSessionById, findUserByEmailId, findUserById, updateSession } from "./auth.repository.js";
import { Role } from "../../../generated/prisma/enums.js";
import { logger } from "../../logger/logger.js";
import { userEventsQueue } from "../../lib/queue.js";

const saltRounds = 10;

interface SignupData {
    name: string;
    email: string;
    password: string;
    role: Role;
    userAgent: string | null;
    ipAddress: string | null;
    requestId: string;
}
interface LoginData {
    email: string;
    password: string;
    userAgent: string | null;
    ipAddress: string | null;
}
interface SignupOrLoginResponse {
    userId: string;
    email: string;
    name: string;
    accessToken: string;
    refreshToken: string;
}

interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
}

interface SessionsResponse {
    id: string;
    userAgent: string | null;
    ipAddress: string | null;
    lastUsedAt: string;
    createdAt: string;
}

class AuthService {
    public async signup(signupData: SignupData): Promise<SignupOrLoginResponse> {
        const existingUser = await findUserByEmailId(signupData.email);
        if (existingUser) {
            throw new ConflictError("User with this email already exists.");
        }
        
        const responseData = await prisma.$transaction(async (tx) => {
            const hashedPassword = await bcrypt.hash(signupData.password, saltRounds);
        
            const user = await createUser(signupData.name, signupData.email, hashedPassword, signupData.role, tx);
            const expireAfter = 7*24*60*60*1000;
            const sessionId = crypto.randomUUID();
            const refreshToken = tokenService.generateRefreshToken(sessionId, user.id);
            const refreshTokenHash = tokenService.hashRefreshToken(refreshToken);
            await createSession(sessionId, user.id, expireAfter, signupData.userAgent, signupData.ipAddress, refreshTokenHash, tx);
            const accessToken = tokenService.generateAccessToken(user);
            return {
                userId: user.id,
                name: user.name,
                email: user.email,
                accessToken,
                refreshToken
            }
        });
       
        await userEventsQueue.add("user.signed_up", {
                userId: responseData.userId,
                email: responseData.email,
                requestId: signupData.requestId,
                occurredAt: new Date().toISOString(),
            },
            {
                jobId: `user.signed_up:${responseData.userId}`
            },
        );

        return {
            userId: responseData.userId,
            email: responseData.email,
            name: responseData.name,
            accessToken: responseData.accessToken,
            refreshToken: responseData.refreshToken,
        };
    }
    public async login(loginData: LoginData): Promise<SignupOrLoginResponse> {
        const user = await findUserByEmailId( loginData.email)
        if(!user) {
            throw new UnauthorizedError("Invalid email or password");
        }
        
        const passwordMatch = await bcrypt.compare(loginData.password, user.passwordHash);
        if(!passwordMatch) {
            throw new UnauthorizedError("Invalid email or password");
        }
        
        const tokens = await prisma.$transaction(async (tx)=>{
            const sevenDaysInMiliSeconds = 7*24*60*60*1000;
            const sessionId = crypto.randomUUID();
            const refreshToken = tokenService.generateRefreshToken(sessionId, user.id);
            const accessToken = tokenService.generateAccessToken(user);

            const hashRefreshToken = tokenService.hashRefreshToken(refreshToken);
            await createSession(sessionId, user.id, sevenDaysInMiliSeconds, loginData.userAgent, loginData.ipAddress, hashRefreshToken, tx );

            return { accessToken, refreshToken }
        });
        
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            userId: user.id,
            name: user.name,
            email: user.email,
        }
    }

    public async refresh(receivedRefreshToken: string): Promise<RefreshResponse> {
        const {userId, sessionId} = tokenService.verifyRefreshToken(receivedRefreshToken);

        const tokens = await prisma.$transaction(async (tx) => {
            let session: Awaited<ReturnType<typeof findSessionById>>;
            let user: Awaited<ReturnType<typeof findUserById>>;
            try {
                session = await findSessionById(sessionId, tx);
                if(session.expiresAt < new Date()){
                    await deleteSession(session.id, tx);
                    throw new UnauthorizedError("Invalid refresh token");
                }
                if(session.userId !== userId) throw new UnauthorizedError("Invalid refresh token");
                user = await findUserById(userId, tx);
            } catch (error) {
                if (error instanceof NotFoundError) {
                    throw new UnauthorizedError("Invalid refresh token");
                }
                throw error;
            }

            const receivedRefreshTokenHash = tokenService.hashRefreshToken(receivedRefreshToken);
            if((session.refreshTokenHash !== receivedRefreshTokenHash)) throw new UnauthorizedError("Invalid refresh token");

            // rotate refresh token
            const newRefreshToken = tokenService.generateRefreshToken(session.id, session.userId);

            const newAccessToken = tokenService.generateAccessToken(user);

            // update session hash
            const newRefreshTokenHash = tokenService.hashRefreshToken(newRefreshToken);
            await updateSession(session.id, {refreshTokenHash: newRefreshTokenHash, lastUsedAt: new Date()}, tx);
            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            }
        });
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        }
    }
    public async logout(refreshToken: string): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const {userId, sessionId} = tokenService.verifyRefreshToken(refreshToken);
            const refreshTokenHash = tokenService.hashRefreshToken(refreshToken);
            let session: Awaited<ReturnType<typeof findSessionById>>;
            try {
                session = await findSessionById(sessionId, tx);
                if(session.expiresAt < new Date()){
                    await deleteSession(session.id, tx);
                    return;
                }
                if(session.userId !== userId) throw new UnauthorizedError("Invalid refresh token");
            } catch(error){
                if(error instanceof NotFoundError){
                    return;
                }
                throw error;
            }
            if(session.refreshTokenHash !== refreshTokenHash) throw new UnauthorizedError("Invalid refresh token");
            await deleteSession(sessionId, tx);
        });
        return;
    }
    public async logoutAll(refreshToken: string): Promise<void> {
        const {userId, sessionId} = tokenService.verifyRefreshToken(refreshToken);
        const refreshTokenHash = tokenService.hashRefreshToken(refreshToken);
        let session: Awaited<ReturnType<typeof findSessionById>>;
        try {
            session = await findSessionById(sessionId);
            if(session.expiresAt < new Date()){
                await deleteSession(session.id);
                throw new UnauthorizedError("Invalid refresh token");
            }
            if(session.userId !== userId) throw new UnauthorizedError("Invalid refresh token");
        } catch(error){
            if(error instanceof NotFoundError){
                return;
            }
            throw error;
        }
        if(session.refreshTokenHash !== refreshTokenHash) throw new UnauthorizedError("Invalid refresh token");
        await deleteAllSessionForUser(userId);
        return;
    }
    public async sessions(userId: string): Promise<SessionsResponse[]> {
        const sessions = await findAllUserSessions(userId);
        const responseData = sessions.map((session)=>{
            return {
                id: session.id,
                userAgent: session.userAgent,
                ipAddress: session.ipAddress,
                lastUsedAt: String(session.lastUsedAt),
                createdAt: String(session.createdAt),
            };
        });
        return responseData;
    }
}

export const authService = new AuthService();