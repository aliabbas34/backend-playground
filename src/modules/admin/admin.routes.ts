import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { adminController } from "./admin.controller.js";
import { userRoleUpdateBodySchema, userRoleUpdateParamSchema } from "./admin.schema.js";
import { validate } from "../../middlewares/validate.js";

const adminRouter = Router();

adminRouter.get("/users", authenticate, authorize("ADMIN"), adminController.listUsers);
adminRouter.patch("/users/:id/role", authenticate, authorize("ADMIN"), validate({body: userRoleUpdateBodySchema, params: userRoleUpdateParamSchema}), adminController.updateUserRole);

export default adminRouter;