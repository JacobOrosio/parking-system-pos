import jwt from "jsonwebtoken";
import type { CustomAppEnv, UserInfo } from "../types/app-env.type.js";
import type { Context, Next } from "hono";

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (c: Context<CustomAppEnv>, next: Next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ message: "Authorization required" }, 401);
  }

  const token = authHeader.split(" ")[1];

  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not set in environment variables.");
    return c.json({ message: "Internal server error" }, 500);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    c.set("user", decoded as UserInfo);
    await next();
  } catch {
    return c.json({ message: "Invalid or expired token" }, 401);
  }
};

export { authMiddleware };
