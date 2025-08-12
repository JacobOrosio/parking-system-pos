import { z } from "zod";

export const createParkingTicketSchema = z.object({
  vehicleType: z.string(),
  issuedById: z.string(),
  isPWD: z.boolean(),
});

export const payParkingTicketSchema = z.object({
  ticketId: z.string(),
  totalFee: z.number(),
  durationMins: z.number(),
  checkedOutById: z.string(),
});

export const payFirstParkingTicketSchema = z.object({
  totalFee: z.number(),
  isPWD: z.boolean(),
  issuedById: z.string(),
});
