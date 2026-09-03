import { prisma } from "../../../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { envConfig } from "../../config/env.js";

const saltRounds = 10;

interface SignupData {
    name: string;
    email: string;
    password: string;
}
interface LoginData {
    email: string;
    password: string;
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

class AuthService {
    public async signup(signupData: SignupData): Promise<SignupResponse> {
        //check existing user in database via email.
        const existingUser = await prisma.user.findUnique({
            where: { email: signupData.email },
        });
        if (existingUser) {
            throw new Error("User with this email already exists.");
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(signupData.password, saltRounds);
        // Create the user in the database
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
        // find user
        const user = await prisma.user.findUnique({
            where: {
                email: loginData.email,
            }
        });
        if(!user) {
            throw new Error("User does not exist!");
        }
        // compare hash
        const passwordMatch = await bcrypt.compare(loginData.password, user.passwordHash);
        if(!passwordMatch) {
            throw new Error("Wrong password! Authentication failed.");
        }
        // generate tokens
        const accessToken = jwt.sign({sub:user.id, email: user.email}, envConfig.ACCESS_TOKEN_SECRET, {expiresIn: '15m'} );
        const refreshToken = jwt.sign({sub: user.id}, envConfig.REFRESH_TOKEN_SECRET, {expiresIn: '7d'});

        // return response
        return {
            accessToken,
            refreshToken,
            userId: user.id,
            name: user.name,
            email: user.email,
        }
    }
}

export const authService = new AuthService();