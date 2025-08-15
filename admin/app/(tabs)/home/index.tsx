import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useSession } from "@/context/ctx";
import { useQuery } from "@tanstack/react-query";
import { getRevenue, getUnpaidTickets } from "@/api/queries/revenue";
import { BarChart, LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { LogOut } from "lucide-react-native";
import { useRouter } from "expo-router";

const screenWidth = Dimensions.get("window").width;

export default function Home() {
  const { signOut } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState<"week" | "year">("week");
  const [timeOffset, setTimeOffset] = useState(0);
  const [isComponentMounted, setIsComponentMounted] = useState(false);

  const {
    data: revenueData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["revenue", filter, timeOffset],
    queryFn: () => getRevenue(filter, timeOffset),
  });

  const { data: unpaidTickets, isLoading: isUnpaidLoading } = useQuery({
    queryKey: ["revenue"],
    queryFn: () => getUnpaidTickets(),
  });

  useEffect(() => {
    setIsComponentMounted(true);
  }, []);

  const labels = revenueData?.data?.map((item: any) => item.label) ?? [];
  const dataPoints =
    revenueData?.data?.map((item: any) =>
      typeof item.revenue === "number" && isFinite(item.revenue)
        ? item.revenue
        : 0
    ) ?? [];

  const totalRevenue = revenueData?.totalRevenue ?? 0;
  const totalParking = revenueData?.totalParking ?? 0;

  const getTimeRangeLabel = () => {
    if (timeOffset === 0) {
      return `This ${filter.charAt(0).toUpperCase() + filter.slice(1)}`;
    } else if (timeOffset === -1) {
      return `Last ${filter.charAt(0).toUpperCase() + filter.slice(1)}`;
    } else {
      return `${Math.abs(timeOffset)} ${filter}${Math.abs(timeOffset) > 1 ? "s" : ""} ago`;
    }
  };

  const handleFilterChange = (newFilter: "week" | "year") => {
    if (isComponentMounted) {
      setFilter(newFilter);
      setTimeOffset(0);
    }
  };

  const handleTimeOffsetChange = (newOffset: number) => {
    if (isComponentMounted) {
      setTimeOffset(newOffset);
    }
  };

  const canGoBack = () => {
    return timeOffset > -12;
  };

  const canGoForward = () => {
    return timeOffset < 0;
  };

  if (!isComponentMounted) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 ">
      <StatusBar
        barStyle="light-content"
        backgroundColor="#6200EE"
        translucent={false}
      />
      <ScrollView
        className="flex-1 mt-10 bg-white"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex flex-row justify-between items-center border-b-2 border-gray-200 p-4 ">
          <Text className="text-3xl font-extrabold">Dashboard</Text>
          <TouchableOpacity
            className="flex flex-row  gap-2 items-center border py-2 px-4 rounded-xl bg-red-500 border-gray-400"
            onPress={signOut}
          >
            <LogOut color="white" size={20} />
            <Text className="text-white font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>

        <View className="h-full py-5 px-3">
          <View className="flex flex-col">
            <View className="flex flex-row mb-3 w-full h-28 justify-between gap-2 items-center">
              {/* Revenue Card */}

              <TouchableOpacity
                onPress={() =>
                  router.push("/(tabs)/home/components/user-transactions")
                }
                className="w-[55%] -ml-1 flex items-center justify-center bg-[#2563eb] rounded-xl border-gray-500 border h-full px-3 py-4"
              >
                <Text className="text-2xl font-semibold text-center text-white">
                  Staff Transactions
                </Text>
              </TouchableOpacity>

              {/* Parking Sessions Card */}
              <View className="w-[45%] flex-col items-center bg-[#2563eb] rounded-xl border-gray-500 border h-full px-3 py-4">
                <Text className="text-xl font-semibold text-white mb-2">
                  Parking Sessions
                </Text>
                <Text className="text-3xl font-semibold text-white">
                  {totalParking.toLocaleString("en-PH")}
                </Text>
              </View>
            </View>

            <View className="flex flex-row mb-3 w-full h-28 justify-between gap-2 items-center">
              {/* User Sessions Button */}
              <TouchableOpacity
                className="w-[55%] -ml-1 flex-col justify-between bg-[#059669] rounded-xl border-gray-500 border h-full px-3 py-4"
                onPress={() =>
                  router.push("/(tabs)/home/components/revenue-details")
                }
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View className="flex-1 justify-center items-center">
                    <ActivityIndicator color="#FFF" size="small" />
                  </View>
                ) : (
                  <>
                    <Text className="text-xl font-semibold text-white">
                      Revenue
                    </Text>
                    <Text className="text-2xl font-semibold text-white">
                      ₱{" "}
                      {totalRevenue.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                    <Text className="text-sm text-white">
                      {getTimeRangeLabel()}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Unpaid Tickets */}
              <TouchableOpacity
                onPress={() =>
                  router.push("/(tabs)/home/components/unpaid.tickets")
                }
                className="w-[45%] flex-col items-center bg-[#2563eb] rounded-xl border-gray-500 border h-full px-3 py-4"
              >
                {isUnpaidLoading ? (
                  <View className="flex-1 justify-center items-center">
                    <ActivityIndicator color="#FFF" size="small" />
                  </View>
                ) : (
                  <>
                    <Text className="text-xl font-semibold text-white mb-2">
                      Unpaid Tickets
                    </Text>
                    <Text className="text-3xl font-semibold text-white">
                      {unpaidTickets?.totalUnpaidTickets ?? 0}
                    </Text>
                    <Text className="text-sm text-white text-start">
                      All unpaid tickets
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterContainer}>
            <View style={styles.filterRow}>
              {["week", "year"].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => handleFilterChange(type as any)}
                  style={[
                    styles.filterButton,
                    filter === type
                      ? styles.filterButtonActive
                      : styles.filterButtonInactive,
                  ]}
                >
                  <Text
                    style={
                      filter === type
                        ? styles.filterButtonTextActive
                        : styles.filterButtonTextInactive
                    }
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.navigationContainer}>
            <TouchableOpacity
              onPress={() => handleTimeOffsetChange(timeOffset - 1)}
              disabled={!canGoBack()}
              style={[
                styles.navigationButton,
                canGoBack()
                  ? styles.navigationButtonActive
                  : styles.navigationButtonInactive,
              ]}
            >
              <Text
                style={
                  canGoBack()
                    ? styles.navigationButtonTextActive
                    : styles.navigationButtonTextInactive
                }
              >
                ← Previous
              </Text>
            </TouchableOpacity>

            <View style={styles.currentPeriod}>
              <Text style={styles.currentPeriodText}>
                {getTimeRangeLabel()}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => handleTimeOffsetChange(timeOffset + 1)}
              disabled={!canGoForward()}
              style={[
                styles.navigationButton,
                canGoForward()
                  ? styles.navigationButtonActive
                  : styles.navigationButtonInactive,
              ]}
            >
              <Text
                style={
                  canGoForward()
                    ? styles.navigationButtonTextActive
                    : styles.navigationButtonTextInactive
                }
              >
                Next →
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Revenue Trend</Text>
            </View>

            {dataPoints.length > 0 && dataPoints.some((val: any) => val > 0) ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={{
                    labels,
                    datasets: [{ data: dataPoints }],
                  }}
                  width={Math.max(screenWidth - 48, labels.length * 60)}
                  height={240}
                  yAxisLabel="₱"
                  chartConfig={{
                    backgroundColor: "transparent",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#f8fafc",
                    decimalPlaces: 2,
                    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
                    propsForBackgroundLines: {
                      strokeWidth: 1,
                      stroke: "#e5e7eb",
                      strokeDasharray: "5,5",
                    },
                  }}
                  style={{
                    borderRadius: 16,
                    marginRight: 16,
                  }}
                  showValuesOnTopOfBars
                />
              </ScrollView>
            ) : (
              <View style={styles.noDataContainer}>
                <View style={styles.noDataIcon}>
                  <Text style={styles.noDataIconText}>📊</Text>
                </View>
                <Text style={styles.noDataTitle}>No data available</Text>
                <Text style={styles.noDataSubtitle}>
                  for {getTimeRangeLabel().toLowerCase()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    marginBottom: 24,
    padding: 4,
    backgroundColor: "#F3F4F6", // Tailwind: bg-gray-100
    borderRadius: 8,
  },
  filterRow: {
    flexDirection: "row",
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: "#FFFFFF",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  filterButtonInactive: {
    backgroundColor: "transparent",
  },
  filterButtonTextActive: {
    color: "#1F2937",
    fontWeight: "500",
  },
  filterButtonTextInactive: {
    color: "#6B7280",
    fontWeight: "500",
  },
  navigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    padding: 4,
    backgroundColor: "#F3F4F6", // Tailwind gray-100
    borderRadius: 8,
  },
  navigationButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  navigationButtonActive: {
    backgroundColor: "#FFFFFF",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  navigationButtonInactive: {
    backgroundColor: "transparent",
  },
  navigationButtonTextActive: {
    color: "#1F2937", // Tailwind gray-800
    fontWeight: "500",
  },
  navigationButtonTextInactive: {
    color: "#6B7280", // Tailwind gray-500
    fontWeight: "500",
  },
  currentPeriod: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  currentPeriodText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827", // Tailwind gray-900
  },

  chartContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },
  chartIndicator: {
    width: 12,
    height: 12,
    backgroundColor: "#10b981",
    borderRadius: 6,
  },
  chartWrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  noDataContainer: {
    paddingVertical: 64,
    alignItems: "center",
  },
  noDataIcon: {
    width: 64,
    height: 64,
    backgroundColor: "#f3f4f6",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  noDataIconText: {
    fontSize: 50,
  },
  noDataTitle: {
    color: "#6b7280",
    fontWeight: "600",
    textAlign: "center",
  },
  noDataSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    color: "#6b7280",
    fontSize: 16,
  },
});
