import { Hono } from "hono";
import { authMiddleware } from "../helpers/middleware.js";
import type { CustomAppEnv } from "../types/app-env.type.js";
import {
  findUserById,
  getAllUserStatus,
  updateUserStatus,
} from "../services/user.service.js";
import { zValidator } from "@hono/zod-validator";
import { updateStatusSchema } from "../schemas/auth.js";

const profile = new Hono<CustomAppEnv>();
profile.use(authMiddleware);

profile.get("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user) throw new Error("Failed to get user from context");

    const foundUser = await findUserById(user?.id);
    if (!foundUser) {
      return c.json({ message: "User not found" }, 404);
    }

    const { password, ...userData } = foundUser;
    return c.json(userData, 200);
  } catch (error) {
    return c.json({ message: "Internal server error" }, 500);
  }
});

profile.get("/status", async (c) => {
  try {
    const user = c.get("user");
    if (!user) throw new Error("Failed to get user from context");
    const userStatus = await getAllUserStatus();
    return c.json(userStatus);
  } catch (error) {
    return c.json({ message: "Internal server error" }, 500);
  }
});

profile.put("/status", zValidator("json", updateStatusSchema), async (c) => {
  try {
    const { id, status } = c.req.valid("json");

    const updatedUser = await updateUserStatus(id, status);

    if (!updatedUser) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    return c.json({ success: true, data: updatedUser }, 200);
  } catch (error) {
    console.error("Error in /status handler:", error);
    return c.json({ success: false, message: "Internal server error" }, 500);
  }
});

export default profile;
