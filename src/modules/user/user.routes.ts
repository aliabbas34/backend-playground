import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { validate } from "../../middlewares/validate.js";
import { authorizeOwner } from "../../middlewares/authorizeOwner.js";
import { userController } from "./user.controller.js";
import { updateUserBodySchema, updateUserParamSchema } from "./user.schema.js";
import { authorize } from "../../middlewares/authorize.js";

const userRouter = Router();

userRouter.patch("/:id/profile", authenticate, validate({params: updateUserParamSchema, body: updateUserBodySchema}), authorizeOwner, userController.updateProfile)

export default userRouter;