import { signupSchema, loginSchema, refreshTokenInBodySchema } from "./auth.schema.js";
import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { loginRateLimit } from "../../middlewares/rateLimit.js";

const authRouter = Router();

authRouter.post("/signup", validate({ body: signupSchema}), authController.signup);
authRouter.post("/login", loginRateLimit, validate({body: loginSchema}), authController.login);
authRouter.get("/me", authenticate, authController.me )
authRouter.post("/refresh", validate({body: refreshTokenInBodySchema}), authController.refresh);
authRouter.post("/logout", authenticate, validate({body: refreshTokenInBodySchema}), authController.logout);
authRouter.post("/logout-all", authenticate, validate({body: refreshTokenInBodySchema}), authController.logoutAll);
authRouter.get("/sessions", authenticate, authController.sessions);

export default authRouter;