import { Role } from "../../../generated/prisma/enums.js";
import { NotFoundError } from "../../errors/not-found-error.js";
import { userEventsQueue } from "../../lib/queue.js";
import { invalidateUserCache, redisClient } from "../../lib/redis.js";
import { logger } from "../../logger/logger.js";
import { buildPaginatedResponse, PaginatedResponse } from "../../utils/api-response.js";
import { getPaginationOffset } from "../../utils/pagination.js";
import { PublicUser, UserFilterParams, userRepository } from "./user.repository.js";

interface UserProfileUpdateData {
    name: string,
    email: string
}

class UserService {
    public async updateProfile(userId: string, updateData: UserProfileUpdateData, requestId: string): Promise<void> {
        await userRepository.updateUserProfile(userId, updateData);
        await invalidateUserCache(userId);
        try {
            await userEventsQueue.add("profile.updated", 
                {
                    userId,
                    email: updateData.email,
                    requestId: requestId,
                    occurredAt: new Date().toISOString(),
                },
                {
                    jobId: `profile.updated-${userId}`
                },
            );
        } catch(error) {
            logger.error({error, userId}, "Failed to enqueue profile update event");
        }
        return;
    }
    public async listUsers(page: number, limit: number, search?: string, role?: Role): Promise<PaginatedResponse<PublicUser>> {
        const key = [
            "users:list",
            `page=${page}`,
            `limit=${limit}`,
            `role=${role??""}`,
            `search=${encodeURIComponent(search??"")}`,
        ].join(":");
        const cached = await redisClient.get(key);
        if(cached) {
            logger.info("Cache hit. while getting users list");
            return JSON.parse(cached) as PaginatedResponse<PublicUser>;
        }
        const { skip, take } = getPaginationOffset(page, limit);
        const filters: UserFilterParams = {
            skip,
            take,
            ...(search !== undefined && { search }),
            ...(role !== undefined && { role }),
        };
        const {data, total} = await userRepository.findManyWithFilters(filters);
        const paginatedData = buildPaginatedResponse(data, total, page, limit, "Users fetched successfully");
        await redisClient.set(key, JSON.stringify(paginatedData), { EX: 300 });
        return paginatedData;
    }
    public async userProfile(userId: string):Promise<PublicUser> {
        const key = `users:profile:${userId}`;
        const cached = await redisClient.get(key);
        if(cached){
            logger.info("Cache hit while getting user profile");
            return JSON.parse(cached) as PublicUser;
        }
        const profile = await userRepository.findUser(userId);
        if(!profile) {
            throw new NotFoundError("user not found");
        }
        await redisClient.set(key, JSON.stringify(profile), { EX: 600 });
        return profile;
    }
}

export const userService = new UserService();