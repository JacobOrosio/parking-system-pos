import { prisma } from "../helpers/db.js";

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findFirst({
    where: { email },
  });
};

export const createUser = async (data: any) => {
  return await prisma.user.create({
    data,
  });
};

export const findUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
};
