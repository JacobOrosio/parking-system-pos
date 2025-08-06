import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { signInSchema, signUpSchema } from "../schemas/auth.js";
import { createUser, findUserByEmail } from "../services/user.service.js";
import argon from "argon2";
import { verify } from "argon2";
import jwt from "jsonwebtoken";

const auth = new Hono();

auth.post("/signup", zValidator("json", signUpSchema), async (c) => {
  try {
    const { password: plainPassword, ...userData } = c.req.valid("json");
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("Failed to retrieve jwt secret");
    }

    const foundUserByEmail = await findUserByEmail(userData.email);
    if (foundUserByEmail) {
      return c.json({ message: "Email is already in use" }, 400);
    }

    const hashedPassword = await argon.hash(plainPassword);
    const createdUser = await createUser({
      password: hashedPassword,
      ...userData,
    });

    if (!createdUser) {
      throw new Error("Failed to create user");
    }

    const { password, ...tokenPayload } = createdUser;
    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: "24h" });

    return c.json({ token }, 201);
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

auth.post("/signin", zValidator("json", signInSchema), async (c) => {
  try {
    const body = c.req.valid("json");

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("Failed to retrieve jwt secret");
    }

    const foundUser = await findUserByEmail(body.email);
    if (!foundUser) {
      return c.json({ message: "User not found" }, 404);
    }

    if (!foundUser?.password) {
      return c.json({ message: "Password not set for user" }, 401);
    }

    const isPasswordCorrect = await verify(foundUser.password, body.password);
    if (!isPasswordCorrect) {
      return c.json({ message: "Incorrect password" }, 401);
    }

    const { password, ...userData } = foundUser;
    const token = jwt.sign(userData, jwtSecret, { expiresIn: "24h" });

    return c.json({ token }, 200);
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

auth.post("/signin-admin", zValidator("json", signInSchema), async (c) => {
  try {
    const body = c.req.valid("json");

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("Failed to retrieve jwt secret");
    }

    const foundUser = await findUserByEmail(body.email);
    if (!foundUser) {
      return c.json({ message: "User not found" }, 404);
    }

    if (!foundUser?.password) {
      return c.json({ message: "Password not set for user" }, 401);
    }

    const isPasswordCorrect = await verify(foundUser.password, body.password);
    if (!isPasswordCorrect) {
      return c.json({ message: "Incorrect password" }, 401);
    }

    if (foundUser.role !== "ADMIN") {
      return c.json({ message: "Invalid Role" }, 401);
    }

    const { password, ...userData } = foundUser;
    const token = jwt.sign(userData, jwtSecret, { expiresIn: "24h" });

    return c.json({ token }, 200);
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default auth;
