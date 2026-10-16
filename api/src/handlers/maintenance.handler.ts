import { Hono } from "hono";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "../helpers/db.js";
import {
  cleanupParkingData,
  cleanupOldParkingTickets,
  getParkingDataCleanupCutoff,
} from "../services/parking-cleanup.service.js";

const maintenanceRoute = new Hono();

const hasValidCleanupSecret = (providedSecret: string | undefined) => {
  const cleanupSecret = process.env.CLEANUP_SECRET;

  if (!cleanupSecret || !providedSecret || providedSecret.length !== cleanupSecret.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(providedSecret), Buffer.from(cleanupSecret));
};

maintenanceRoute.post("/cleanup-parking-data", async (c) => {
  if (!process.env.CLEANUP_SECRET) {
    console.error("CLEANUP_SECRET is not set.");
    return c.json({ message: "Cleanup endpoint is not configured" }, 503);
  }

  if (!hasValidCleanupSecret(c.req.header("X-Cleanup-Secret"))) {
    return c.json({ message: "Invalid cleanup secret" }, 401);
  }

  const body = await c.req.json().catch(() => ({}));
  const execute =
    typeof body === "object" && body !== null && "execute" in body && body.execute === true;
  const result = await cleanupParkingData(prisma, getParkingDataCleanupCutoff(), execute);

  return c.json(result);
});

maintenanceRoute.post("/cleanup-old-parking-tickets", async (c) => {
  if (!process.env.CLEANUP_SECRET) {
    console.error("CLEANUP_SECRET is not set.");
    return c.json({ message: "Cleanup endpoint is not configured" }, 503);
  }

  if (!hasValidCleanupSecret(c.req.header("X-Cleanup-Secret"))) {
    return c.json({ message: "Invalid cleanup secret" }, 401);
  }

  const body = await c.req.json().catch(() => ({}));
  const execute =
    typeof body === "object" && body !== null && "execute" in body && body.execute === true;
  const result = await cleanupOldParkingTickets(
    prisma,
    getParkingDataCleanupCutoff(),
    execute,
  );

  return c.json(result);
});

export default maintenanceRoute;
