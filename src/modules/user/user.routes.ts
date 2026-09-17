import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { validate } from "../../middlewares/validate.js";
import { authorizeOwner } from "../../middlewares/authorizeOwner.js";
import { userController } from "./user.controller.js";
import { listUsersQuerySchema, updateUserBodySchema, updateUserParamSchema } from "./user.schema.js";

const userRouter = Router();

userRouter.get("/", authenticate, validate({query: listUsersQuerySchema}), userController.listUsers);
userRouter.patch("/:id/profile", authenticate, validate({params: updateUserParamSchema, body: updateUserBodySchema}), authorizeOwner, userController.updateProfile)

export default userRouter;