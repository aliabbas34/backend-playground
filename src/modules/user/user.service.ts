import { updateUserProfile } from "./user.repository.js";

interface UserProfileUpdateData {
    name: string,
    email: string
}

class UserService{
    public async updateProfile(userId: string, updateData: UserProfileUpdateData): Promise<void> {
        await updateUserProfile(userId, updateData);
        return;
    }
}

export const userService = new UserService();