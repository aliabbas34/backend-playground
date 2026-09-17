import { Role } from "../../../generated/prisma/enums.js";
import { buildPaginatedResponse, PaginatedResponse } from "../../utils/api-response.js";
import { getPaginationOffset } from "../../utils/pagination.js";
import { PublicUser, UserFilterParams, userRepository } from "./user.repository.js";

interface UserProfileUpdateData {
    name: string,
    email: string
}

class UserService{
    public async updateProfile(userId: string, updateData: UserProfileUpdateData): Promise<void> {
        await userRepository.updateUserProfile(userId, updateData);
        return;
    }
    public async listUsers(page: number, limit: number, search?: string, role?: Role): Promise<PaginatedResponse<PublicUser>> {
        const { skip, take } = getPaginationOffset(page, limit);
        const filters: UserFilterParams = {
            skip,
            take,
            ...(search !== undefined && { search }),
            ...(role !== undefined && { role }),
        };
        const {data, total} = await userRepository.findManyWithFilters(filters);
        return buildPaginatedResponse(data, total, page, limit, "Users fetched successfully");
    }
}

export const userService = new UserService();