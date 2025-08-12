import { prisma } from "../helpers/db.js";

type CreateParkingTicketInput = {
  vehicleType: string;
  issuedById: string;
  isPWD: boolean;
};

export const createParkingTicket = async (input: CreateParkingTicketInput) => {
  return await prisma.parkingTicket.create({
    data: {
      vehicleType: input.vehicleType,
      issuedById: input.issuedById,
      isPWD: input.isPWD,
    },
  });
};

export async function getParkingTicketById(id: string) {
  try {
    return await prisma.parkingTicket.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    throw new Error("Unable to retrieve ticket");
  }
}

type PayParkingTicketInput = {
  ticketId: string;
  totalFee: number;
  durationMins: number;
  checkedOutById: string;
};

export const payParkingTicket = async (input: PayParkingTicketInput) => {
  const { ticketId, totalFee, durationMins, checkedOutById } = input;

  try {
    const exitTime = new Date();

    const updatedTicket = await prisma.parkingTicket.update({
      where: { id: ticketId },
      data: {
        exitTime,
        totalFee,
        checkedOut: true,
      },
    });

    const log = await prisma.parkingLog.create({
      data: {
        ticketId,
        durationMins,
        feeCharged: totalFee,
        checkedOutById,
      },
    });

    return { updatedTicket, log };
  } catch (error) {
    console.error("Error paying parking ticket:", error);
    throw new Error("Failed to pay parking ticket");
  }
};

type PayFirstTicketInput = {
  totalFee: number;
  isPWD: boolean;
  issuedById: string;
};

export const payFirstTicket = async (input: PayFirstTicketInput) => {
  const exitTime = new Date();
  const createParkingTicket = await prisma.parkingTicket.create({
    data: {
      vehicleType: "motorcycle",
      issuedById: input.issuedById,
      isPWD: input.isPWD,
      totalFee: input.totalFee,
      checkedOut: true,
      exitTime,
    },
  });
  const createParkingLog = await prisma.parkingLog.create({
    data: {
      ticketId: createParkingTicket.id,
      durationMins: 0,
      feeCharged: input.totalFee,
      checkedOutById: input.issuedById,
    },
  });

  return {
    ticket: createParkingTicket,
    log: createParkingLog,
  };
};
