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

type UserStatusPayload = {
  id: string;
  name: string;
  email: string;
  status: string | null;
  role: string;
};

export const getAllUserStatus = async (): Promise<UserStatusPayload[]> => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      role: true,
    },
  });
};

export const updateUserStatus = async (
  userId: string,
  status: "active" | "inactive"
) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });
    return updatedUser;
  } catch (error) {
    console.error("Error updating user status:", error);
    throw new Error("Failed to update user status");
  }
};
