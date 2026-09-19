import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { validate } from "../../middlewares/validate.js";
import { authorizeOwner } from "../../middlewares/authorizeOwner.js";
import { userController } from "./user.controller.js";
import { listUsersQuerySchema, updateUserBodySchema, updateOrGetUserParamSchema } from "./user.schema.js";

const userRouter = Router();

userRouter.get("/", authenticate, validate({query: listUsersQuerySchema}), userController.listUsers);
userRouter.get("/:id/profile", authenticate, validate({params: updateOrGetUserParamSchema}), authorizeOwner, userController.userProfile )
userRouter.patch("/:id/profile", authenticate, validate({params: updateOrGetUserParamSchema, body: updateUserBodySchema}), authorizeOwner, userController.updateProfile)

export default userRouter;