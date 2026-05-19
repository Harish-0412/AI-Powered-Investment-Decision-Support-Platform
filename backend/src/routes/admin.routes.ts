import { Router } from "express";
import { adminLogin, requireAdmin, listUsers, deleteUser } from "../controllers/admin.controller";
import { asyncHandler } from "../utils/asyncHandler";

export const adminRouter = Router();

adminRouter.post("/login", asyncHandler(adminLogin));
adminRouter.get("/users", requireAdmin, asyncHandler(listUsers));
adminRouter.delete("/users/:id", requireAdmin, asyncHandler(deleteUser));
