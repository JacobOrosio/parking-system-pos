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

export const userTransaction = async (
  page: number = 1,
  pageSize: number = 10
) => {
  const skip = (page - 1) * pageSize;

  const [transactions, totalCount] = await Promise.all([
    prisma.userTransactionSession.findMany({
      skip,
      take: pageSize,
      orderBy: {
        sessionDate: "desc",
      },
      select: {
        id: true,
        userId: true,
        totalAmount: true,
        sessionDate: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.userTransactionSession.count(),
  ]);

  return {
    data: transactions,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
    totalCount,
  };
};
