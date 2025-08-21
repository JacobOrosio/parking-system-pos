import { prisma } from "../helpers/db.js";

export const getRate = async () => {
  return await prisma.rate.findFirst({
    where: {
      isActive: true,
    },
  });
};

export const deleteData = async () => {
  return await prisma.parkingTicket.deleteMany();
};
