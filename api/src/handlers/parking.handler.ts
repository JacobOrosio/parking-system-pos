import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createParkingTicket,
  getParkingTicketById,
  payFirstTicket,
  payParkingTicket,
} from "../services/parking.service.js";
import {
  createParkingTicketSchema,
  payFirstParkingTicketSchema,
  payParkingTicketSchema,
} from "../schemas/parking.js";
import { authMiddleware } from "../helpers/middleware.js";

const parking = new Hono();

parking.use(authMiddleware);

parking.post(
  "/ticket",
  zValidator("json", createParkingTicketSchema),
  async (c) => {
    try {
      const body = c.req.valid("json");
      const ticket = await createParkingTicket(body);

      return c.json({ ticket }, 201);
    } catch (error) {
      console.error("Error creating ticket:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

parking.get("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const ticket = await getParkingTicketById(id);

    console.log(ticket);

    if (!ticket) {
      return c.json({ message: "Invalid QR code" }, 200);
    }

    if (ticket.checkedOut === true) {
      return c.json(
        {
          message: "Ticket already checked out",
          details:
            "This parking ticket has already been processed and checked out.",
        },
        200
      );
    }

    return c.json(ticket);
  } catch (error) {
    return c.json({ message: "Internal server error" }, 500);
  }
});

parking.post(
  "/pay-parking",
  zValidator("json", payParkingTicketSchema),
  async (c) => {
    try {
      const body = c.req.valid("json");
      const ticket = await payParkingTicket(body);
      return c.json({ ticket }, 200);
    } catch (error: any) {
      console.error("Error in handler:", error);
      return c.json({ error: error.message || "Internal server error" }, 500);
    }
  }
);

parking.post(
  "/pay-first-parking",
  zValidator("json", payFirstParkingTicketSchema),
  async (c) => {
    try {
      const body = c.req.valid("json");
      const ticket = await payFirstTicket(body);
      return c.json({ ticket }, 200);
    } catch (error: any) {
      console.error("Error in handler:", error);
      return c.json({ error: error.message || "Internal server error" }, 500);
    }
  }
);

export default parking;
