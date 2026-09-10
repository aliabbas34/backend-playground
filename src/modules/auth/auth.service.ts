import { prisma } from "../../../lib/prisma.js";
import bcrypt from "bcrypt";
import { ConflictError } from "../../errors/conflict-error.js";
import { NotFoundError } from "../../errors/not-found-error.js";
import { UnauthorizedError } from "../../errors/unauthorized-error.js";
import { tokenService } from "./token.service.js";
import { cleanUpExpiredSessions, createSession, deleteAllSessionForUser, deleteSession, findAllUserSessions, findSessionByHash, findSessionById, findUserById, updateSession } from "./auth.repository.js";

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
            throw new NotFoundError("User does not exist!");
        }
        
        const passwordMatch = await bcrypt.compare(loginData.password, user.passwordHash);
        if(!passwordMatch) {
            throw new UnauthorizedError("Wrong password! Authentication failed.");
        }
        
        const accessToken = tokenService.generateAccessToken(user);

        const sevenDaysInMiliSeconds = 7*24*60*60*1000;
        const sessionId = await createSession(user.id, sevenDaysInMiliSeconds, loginData.userAgent, loginData.ipAddress );

        const refreshToken = tokenService.generateRefreshToken(sessionId, user.id);

        const hashRefreshToken = tokenService.hashRefreshToken(refreshToken);
        
        await updateSession(sessionId, {refreshTokenHash: hashRefreshToken});
        
        return {
            accessToken,
            refreshToken,
            userId: user.id,
            name: user.name,
            email: user.email,
        }
    }

    public async refresh(receivedRefreshToken: string): Promise<RefreshResponse> {
        const {userId, sessionId} = tokenService.verifyRefreshToken(receivedRefreshToken);

        await cleanUpExpiredSessions();
        
        const session = await findSessionById(sessionId,userId);
        const user = await findUserById(userId);
        const receivedRefreshTokenHash = tokenService.hashRefreshToken(receivedRefreshToken);
        if((session.refreshTokenHash !== receivedRefreshTokenHash)) throw new UnauthorizedError("Invalid refresh token");

        // rotate refresh token
        const newRefreshToken = tokenService.generateRefreshToken(session.id, session.userId);

        const newAccessToken = tokenService.generateAccessToken(user);

        // update session hash
        const newRefreshTokenHash = tokenService.hashRefreshToken(newRefreshToken);
        await updateSession(session.id, {refreshTokenHash: newRefreshTokenHash});

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
                lastUsedAt: String(session.lastUsed),
                createdAt: String(session.createdAt),
            };
        });
        return responseData;
    }
}

export const authService = new AuthService();