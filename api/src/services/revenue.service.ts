import { prisma } from "../helpers/db.js";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addWeeks,
  addMonths,
  addYears,
  eachDayOfInterval,
  format,
  getDay,
} from "date-fns";

export const getRevenueByFilter = async (
  filter: "week" | "year",
  timeOffset: number = 0
) => {
  const now = new Date();
  let baseDate: Date;
  let startDate: Date;
  let endDate: Date;

  // Calculate the base date based on time offset
  switch (filter) {
    case "week":
      baseDate = addWeeks(now, timeOffset);
      // Start from Sunday (weekStartsOn: 0)
      startDate = startOfWeek(baseDate, { weekStartsOn: 0 });
      endDate = endOfWeek(baseDate, { weekStartsOn: 0 });
      break;
    case "year":
      baseDate = addYears(now, timeOffset);
      startDate = startOfYear(baseDate);
      endDate = endOfYear(baseDate);
      break;
    default:
      throw new Error("Invalid filter type");
  }

  const logs = await prisma.parkingLog.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      createdAt: true,
      feeCharged: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const revenueMap: Record<string, number> = {};
  const parkingCountMap: Record<string, number> = {};

  logs.forEach((log) => {
    const dateKey = log.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
    revenueMap[dateKey] = (revenueMap[dateKey] || 0) + (log.feeCharged ?? 0);
    parkingCountMap[dateKey] = (parkingCountMap[dateKey] || 0) + 1;
  });

  // Generate labels and data based on filter type
  let chartData;

  if (filter === "week") {
    // Generate all 7 days of the week (Sunday to Saturday)
    const weekDays = eachDayOfInterval({ start: startDate, end: endDate });
    const dayLabels = ["S", "M", "T", "W", "TH", "F", "S"];

    chartData = weekDays.map((date, index) => {
      const dateKey = format(date, "yyyy-MM-dd");
      return {
        date: dateKey,
        label: dayLabels[index],
        revenue: revenueMap[dateKey] || 0,
        parkingCount: parkingCountMap[dateKey] || 0,
      };
    });
  } else {
    // For year view, group by months
    const monthsInYear = [];
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(startDate.getFullYear(), i, 1);
      const monthEnd = new Date(startDate.getFullYear(), i + 1, 0);

      let monthRevenue = 0;
      let monthParkingCount = 0;
      Object.entries(revenueMap).forEach(([dateStr, revenue]) => {
        const logDate = new Date(dateStr);
        if (logDate >= monthStart && logDate <= monthEnd) {
          monthRevenue += revenue;
          monthParkingCount += parkingCountMap[dateStr] || 0;
        }
      });

      monthsInYear.push({
        date: format(monthStart, "yyyy-MM-dd"),
        label: format(monthStart, "MMM"), // Jan, Feb, Mar, etc.
        revenue: monthRevenue,
        parkingCount: monthParkingCount,
      });
    }

    chartData = monthsInYear;
  }

  // Calculate totals
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalParking = chartData.reduce(
    (sum, item) => sum + item.parkingCount,
    0
  );

  return {
    data: chartData,
    totalRevenue,
    totalParking,
    summary: {
      period: filter,
      timeOffset,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
    },
  };
};
