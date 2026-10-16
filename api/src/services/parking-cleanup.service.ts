import type { Prisma } from "@prisma/client";
import { subMonths } from "date-fns";

type CleanupTransaction = Pick<
  Prisma.TransactionClient,
  "parkingLog" | "parkingTicket"
>;

export type CleanupDatabase = {
  $transaction<T>(callback: (transaction: CleanupTransaction) => Promise<T>): Promise<T>;
};

export const getParkingDataCleanupCutoff = (now = new Date()) => subMonths(now, 3);

const eligibleTicketWhere = (cutoff: Date) => ({
  checkedOut: true,
  exitTime: { lt: cutoff },
});

const oldTicketWhere = (cutoff: Date) => ({
  entryTime: { lt: cutoff },
});

const cleanupTickets = async (
  database: CleanupDatabase,
  cutoff: Date,
  execute: boolean,
  ticketWhere: ReturnType<typeof eligibleTicketWhere> | ReturnType<typeof oldTicketWhere>,
) => {
  return database.$transaction(async (transaction) => {
    const logWhere = { ticket: ticketWhere };

    if (!execute) {
      const [logs, tickets] = await Promise.all([
        transaction.parkingLog.count({ where: logWhere }),
        transaction.parkingTicket.count({ where: ticketWhere }),
      ]);

      return { dryRun: true, cutoff, logs, tickets };
    }

    const logs = await transaction.parkingLog.deleteMany({ where: logWhere });
    const tickets = await transaction.parkingTicket.deleteMany({ where: ticketWhere });

    return {
      dryRun: false,
      cutoff,
      logs: logs.count,
      tickets: tickets.count,
    };
  });
};

export const cleanupParkingData = (
  database: CleanupDatabase,
  cutoff: Date,
  execute: boolean,
) => cleanupTickets(database, cutoff, execute, eligibleTicketWhere(cutoff));

export const cleanupOldParkingTickets = (
  database: CleanupDatabase,
  cutoff: Date,
  execute: boolean,
) => cleanupTickets(database, cutoff, execute, oldTicketWhere(cutoff));
