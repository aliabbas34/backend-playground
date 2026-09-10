import jwt, { JwtPayload } from "jsonwebtoken";
import { envConfig } from "../../config/env.js";
import crypto from "crypto";
import { UnauthorizedError } from "../../errors/unauthorized-error.js";


class TokenService {
    public generateAccessToken(user: {
        id: string;
        email: string;
        name: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
    }):string {
        const accessToken = jwt.sign({sub:user.id, email: user.email}, envConfig.ACCESS_TOKEN_SECRET, {expiresIn: '15m'} );
        return accessToken;
    }

    public generateRefreshToken(sessionId: string, userId: string): string {
        const refreshToken = jwt.sign({sub: userId, sessionId}, envConfig.REFRESH_TOKEN_SECRET, {expiresIn: '7d'});
        return refreshToken;
    }

    public verifyRefreshToken(refreshToken: string): {userId: string, sessionId: string} {
        const decoded = jwt.verify(refreshToken, envConfig.REFRESH_TOKEN_SECRET);
        if(typeof decoded === "string") throw new UnauthorizedError("Invalid Refresh Token");
        if(typeof decoded.sub !== "string" || typeof decoded.sessionId !== "string") throw new UnauthorizedError("Invalid refresh token");
        return {userId: decoded.sub, sessionId: decoded.sessionId};
    }

    public hashRefreshToken(token: string): string {
        const hash = crypto.createHash('sha256').update(token).digest('hex');
        return hash;
    }

}

export const tokenService = new TokenService();