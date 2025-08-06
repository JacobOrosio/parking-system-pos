import { Hono } from "hono";
import { getRevenueByFilter } from "../services/revenue.service.js";

const revenueRoute = new Hono();

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

export default revenueRoute;
