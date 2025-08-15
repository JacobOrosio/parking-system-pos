import { prisma } from "../helpers/db.js";

export const getUnpaidTicketsByDay = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;

  // Group unpaid tickets per day with pagination
  const rawData = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
    SELECT 
      DATE("createdAt") AS date,
      COUNT(*) AS count
    FROM "ParkingTicket"
    WHERE "exitTime" IS NULL
    GROUP BY DATE("createdAt")
    ORDER BY date DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  // Convert BigInt count → number
  const data = rawData.map((row) => ({
    date: row.date.toISOString().split("T")[0],
    count: Number(row.count),
  }));

  // Get total unpaid tickets (sum of all)
  const totalUnpaidResult = await prisma.$queryRaw<{ total: bigint }[]>`
    SELECT COUNT(*) AS total
    FROM "ParkingTicket"
    WHERE "exitTime" IS NULL
  `;

  const totalUnpaidTickets = Number(totalUnpaidResult[0]?.total || 0);

  return {
    totalUnpaidTickets,
    data,
  };
};
