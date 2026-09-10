import { prisma } from "../../../lib/prisma.js";
import bcrypt from "bcrypt";
import { ConflictError } from "../../errors/conflict-error.js";
import { NotFoundError } from "../../errors/not-found-error.js";
import { UnauthorizedError } from "../../errors/unauthorized-error.js";
import { tokenService } from "./token.service.js";
import { createSession, deleteAllSessionForUser, deleteSession, findAllUserSessions, findSessionById, findUserById, updateSession } from "./auth.repository.js";

const saltRounds = 10;

interface SignupData {
    name: string;
    email: string;
    password: string;
}
interface LoginData {
    email: string;
    password: string;
    userAgent: string | null;
    ipAddress: string | null;
}
interface SignupResponse {
    userId: string;
    email: string;
    name: string;
}
interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    userId: string;
    name: string;
    email: string;
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
    public async signup(signupData: SignupData): Promise<SignupResponse> {
        const existingUser = await prisma.user.findUnique({
            where: { email: signupData.email },
        });
        if (existingUser) {
            throw new ConflictError("User with this email already exists.");
        }
        
        const hashedPassword = await bcrypt.hash(signupData.password, saltRounds);
        
        const user = await prisma.user.create({
            data: {
                name: signupData.name,
                email: signupData.email,
                passwordHash: hashedPassword,
            },
        });
       
        return {
            userId: user.id,
            email: user.email,
            name: user.name,
        };
    }
    public async login(loginData: LoginData): Promise<LoginResponse> {
        const user = await prisma.user.findUnique({
            where: {
                email: loginData.email,
            }
        });
        if(!user) {
            throw new UnauthorizedError("Invalid email or password");
        }
        
        const passwordMatch = await bcrypt.compare(loginData.password, user.passwordHash);
        if(!passwordMatch) {
            throw new UnauthorizedError("Wrong password! Authentication failed.");
        }
        
        const tokens = await prisma.$transaction(async (tx)=>{
            const sevenDaysInMiliSeconds = 7*24*60*60*1000;
            const sessionId = await createSession(tx, user.id, sevenDaysInMiliSeconds, loginData.userAgent, loginData.ipAddress, "dummyRefreshTokenHash" );

            const refreshToken = tokenService.generateRefreshToken(sessionId, user.id);
            const accessToken = tokenService.generateAccessToken(user);

            const hashRefreshToken = tokenService.hashRefreshToken(refreshToken);
            
            await updateSession(tx, sessionId, {refreshTokenHash: hashRefreshToken});

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

        let session: Awaited<ReturnType<typeof findSessionById>>;
        let user: Awaited<ReturnType<typeof findUserById>>;
        try {
            session = await findSessionById(sessionId);
            if(session.expiresAt < new Date()){
                await deleteSession(session.id);
                throw new UnauthorizedError("Invalid refresh token");
            }
            if(session.userId !== userId) throw new UnauthorizedError("Invalid refresh token");
            user = await findUserById(userId);
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
        await updateSession(prisma, session.id, {refreshTokenHash: newRefreshTokenHash, lastUsedAt: new Date()});

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        }
    }
    public async logout(refreshToken: string): Promise<void> {
        const {userId, sessionId} = tokenService.verifyRefreshToken(refreshToken);
        await deleteSession(sessionId);
        return;
    }
    public async logoutAll(refreshToken: string): Promise<void> {
        const { userId, sessionId } = tokenService.verifyRefreshToken(refreshToken);
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