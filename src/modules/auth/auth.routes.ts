import { signupSchema, loginSchema } from "./auth.schema.js";
import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";

const authRouter = Router();

authRouter.post("/signup", validate({ body: signupSchema}), authController.signup);
authRouter.post("/login", validate({body: loginSchema}), authController.login);
authRouter.get("/me", authenticate, authController.me )

export default authRouter;