import { Hono } from "hono";
import {
  getRevenueByFilter,
  recordTransaction,
} from "../services/revenue.service.js";
import { getUnpaidTicketsByDay } from "../services/ticket.service.js";
import { authMiddleware } from "../helpers/middleware.js";
import { userTransaction } from "../services/user.service.js";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import { userTransactionSchema } from "../schemas/parking.js";

const revenueRoute = new Hono();
revenueRoute.use(authMiddleware);

revenueRoute.get("/", async (c) => {
  const filter = c.req.query("filter") as "week" | "year";
  const timeOffsetParam = c.req.query("timeOffset");

  // Parse timeOffset, default to 0 if not provided or invalid
  let timeOffset = 0;
  if (timeOffsetParam) {
    const parsed = parseInt(timeOffsetParam, 10);
    if (!isNaN(parsed)) {
      timeOffset = parsed;
    }
  }

  if (!["week", "year"].includes(filter)) {
    return c.json({ error: "Invalid filter. Use week or year." }, 400);
  }

  // Optional: Add bounds checking for timeOffset
  if (timeOffset < -12 || timeOffset > 0) {
    return c.json(
      {
        error: "Invalid timeOffset. Must be between -12 and 0.",
      },
      400
    );
  }

  try {
    const revenue = await getRevenueByFilter(filter, timeOffset);
    return c.json(revenue);
  } catch (error) {
    console.error("Revenue fetch error:", error);
    return c.json({ error: "Failed to get revenue data" }, 500);
  }
});

revenueRoute.get("/unpaid-tickets-by-day", async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1", 10);
    const limit = parseInt(c.req.query("limit") || "10", 10);

    const result = await getUnpaidTicketsByDay(page, limit);
    return c.json(result);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to fetch unpaid tickets by day" }, 500);
  }
});

revenueRoute.get("/user-transactions", async (c) => {
  try {
    const page = Number(c.req.query("page")) || 1;
    const pageSize = Number(c.req.query("pageSize")) || 10;

    const result = await userTransaction(page, pageSize);

    return c.json(result);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to fetch user transactions" }, 500);
  }
});

revenueRoute.post(
  "/user-transaction",
  zValidator("json", userTransactionSchema),
  async (c) => {
    try {
      const body = c.req.valid("json");
      const transaction = await recordTransaction(body);

      return c.json({ transaction }, 201);
    } catch (error) {
      console.error("Error creating ticket:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

export default revenueRoute;
