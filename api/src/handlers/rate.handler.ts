import { Hono } from "hono";
import { authMiddleware } from "../helpers/middleware.js";
import { deleteData, getRate } from "../services/rate.service.js";

const rateRoute = new Hono();
rateRoute.use(authMiddleware);

rateRoute.get("/", async (c) => {
  try {
    const rate = await getRate();

    return c.json(rate);
  } catch (error) {
    return c.json({ message: "Internal server error" }, 500);
  }
});

rateRoute.post("/delete", async (c) => {
  try {
    const rate = await deleteData();

    return c.json(rate);
  } catch (error) {
    return c.json({ message: "Internal server error" }, 500);
  }
});

export default rateRoute;
