import { Hono } from "hono";
import { authMiddleware } from "../helpers/middleware.js";
import type { CustomAppEnv } from "../types/app-env.type.js";
import { findUserById } from "../services/user.service.js";

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

export default profile;
