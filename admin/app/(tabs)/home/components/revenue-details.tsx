import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useState, useMemo } from "react";
import { getRevenue } from "@/api/queries/revenue";

const { width } = Dimensions.get("window");

export default function RevenueDetails() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "year">("week");
  const [timeOffset, setTimeOffset] = useState(0);

  const {
    data: revenueData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["revenue-details", selectedPeriod, timeOffset],
    queryFn: () => getRevenue(selectedPeriod, timeOffset),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const stats = useMemo(() => {
    if (!revenueData?.data) return null;

    const activeDays = revenueData.data.filter(
      (item: any) => item.revenue > 0
    ).length;
    const totalDays = revenueData.data.length;
    const avgRevenue = revenueData.totalRevenue / activeDays || 0;
    const avgParking = revenueData.totalParking / activeDays || 0;
    const maxRevenue = Math.max(
      ...revenueData.data.map((item: any) => item.revenue)
    );
    const bestDay = revenueData.data.find(
      (item: any) => item.revenue === maxRevenue
    );

    return {
      activeDays,
      totalDays,
      avgRevenue,
      avgParking,
      bestDay,
      maxRevenue,
    };
  }, [revenueData]);

  const formatCurrency = (amount: any) => {
    return `₱${amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const dayFormat = (day: string) => {
    switch (day) {
      case "M":
        return "Monday";
      case "T":
        return "Tuesday";
      case "W":
        return "Wednesday";
      case "TH":
        return "Thursday";
      case "F":
        return "Friday";
      case "SA":
        return "Saturday";
      case "S":
        return "Sunday";
      case "Jan":
        return "January";
      case "Feb":
        return "February";
      case "Mar":
        return "March";
      case "Apr":
        return "April";
      case "May":
        return "May";
      case "Jun":
        return "June";
      case "Jul":
        return "July";
      case "Aug":
        return "August";
      case "Sep":
        return "September";
      case "Oct":
        return "October";
      case "Nov":
        return "November";
      case "Dec":
        return "December";
      default:
        return "Invalid day";
    }
  };

  const getDateRangeLabel = () => {
    if (!revenueData?.summary) return "";

    const start = new Date(revenueData.summary.startDate);
    const end = new Date(revenueData.summary.endDate);

    if (selectedPeriod === "week") {
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    } else {
      return start.getFullYear().toString();
    }
  };

  const navigateTime = (direction: any) => {
    setTimeOffset((prev) => prev + direction);
  };

  const renderPeriodSelector = () => (
    <View style={styles.filterContainer}>
      <View style={styles.filterRow}>
        {["week", "year"].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => {
              setSelectedPeriod(type as "week" | "year");
              setTimeOffset(0);
            }}
            style={[
              styles.filterButton,
              selectedPeriod === type
                ? styles.filterButtonActive
                : styles.filterButtonInactive,
            ]}
          >
            <Text
              style={
                selectedPeriod === type
                  ? styles.filterButtonTextActive
                  : styles.filterButtonTextInactive
              }
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} View
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#059669" />
          <Text className="mt-4 text-gray-600 text-lg">
            Loading revenue data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 mt-10 bg-gray-50">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-white shadow-sm">
          <View className="flex-row items-center justify-between px-6 py-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg"
            >
              <Ionicons name="arrow-back" size={20} color="#374151" />
              <Text className="ml-2 text-gray-700 font-medium">Back</Text>
            </TouchableOpacity>

            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-emerald-500 rounded-full mr-2" />
              <Text className="text-lg font-bold text-gray-800">
                Revenue Details
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6 mt-6">
          {/* Period Selector */}
          {renderPeriodSelector()}

          {/* Time Navigation */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={() => navigateTime(-1)}
              className="bg-white p-3 rounded-lg shadow-sm"
            >
              <Ionicons name="chevron-back" size={20} color="#374151" />
            </TouchableOpacity>

            <View className="flex-1 mx-4">
              <Text className="text-center text-gray-600 text-sm">
                {selectedPeriod === "week" ? "Week of" : "Year"}
              </Text>
              <Text className="text-center text-gray-800 text-lg font-bold">
                {getDateRangeLabel()}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigateTime(1)}
              disabled={timeOffset >= 0}
              className={`p-3 rounded-lg shadow-sm ${
                timeOffset >= 0 ? "bg-gray-200" : "bg-white"
              }`}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={timeOffset >= 0 ? "#D1D5DB" : "#374151"} // Tailwind: gray-300 or gray-700
              />
            </TouchableOpacity>
          </View>

          {/* Revenue Summary Card */}
          <LinearGradient
            colors={["#059669", "#047857"]}
            className="rounded-2xl p-6 mb-6"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-emerald-100 text-sm font-medium mb-1">
                  Total Revenue
                </Text>
                <Text className="text-white text-3xl font-bold">
                  {formatCurrency(revenueData?.totalRevenue || 0)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-emerald-100 text-xs">Total Parking</Text>
                <Text className="text-white text-lg font-bold">
                  {revenueData?.totalParking || 0}
                </Text>
              </View>
              <View>
                <Text className="text-emerald-100 text-xs">Active Days</Text>
                <Text className="text-white text-lg font-bold">
                  {stats?.activeDays || 0}/{stats?.totalDays || 0}
                </Text>
              </View>
              <View>
                <Text className="text-emerald-100 text-xs">Avg/Day</Text>
                <Text className="text-white text-lg font-bold">
                  {formatCurrency(stats?.avgRevenue || 0)}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Revenue List */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              {selectedPeriod === "week" ? "Daily Revenue" : "Monthly Revenue"}
            </Text>

            <View className="flex-row justify-between mb-2 px-1">
              <Text className="text-gray-500 font-medium flex-1">Date</Text>
              <Text className="text-gray-500 font-medium w-24 text-right">
                Parking
              </Text>
              <Text className="text-gray-500 font-medium w-32 text-right">
                Revenue
              </Text>
            </View>

            {revenueData?.data?.map((item: any, index: any) => (
              <View
                key={index}
                className="flex-row justify-between items-center border-b border-gray-100 py-2"
              >
                <Text className="text-gray-800 flex-1">{item.label}</Text>
                <Text className="text-gray-600 w-24 text-right">
                  {item.parkingCount}
                </Text>
                <Text className="text-gray-800 font-medium w-32 text-right">
                  {formatCurrency(item.revenue)}
                </Text>
              </View>
            ))}
          </View>

          {/* Stats Cards */}
          <View className="flex-row space-x-4 mb-6">
            <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
              <View className="flex-row items-center mb-2">
                <Ionicons name="calendar-outline" size={16} color="#059669" />
                <Text className="text-gray-600 text-sm ml-2">
                  Best {selectedPeriod === "week" ? "Day" : "Month"}
                </Text>
              </View>
              <Text className="text-gray-800 text-lg font-bold">
                {dayFormat(stats?.bestDay?.label)}
              </Text>
              <Text className="text-emerald-600 text-sm font-medium">
                {formatCurrency(stats?.maxRevenue || 0)}
              </Text>
            </View>

            <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
              <View className="flex-row items-center mb-2">
                <Ionicons name="car-outline" size={16} color="#059669" />
                <Text className="text-gray-600 text-sm ml-2">Avg Parking</Text>
              </View>
              <Text className="text-gray-800 text-lg font-bold">
                {Math.round(stats?.avgParking || 0)}
              </Text>
              <Text className="text-gray-500 text-sm">
                per {selectedPeriod === "week" ? "day" : "month"}
              </Text>
            </View>
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
    backgroundColor: "#FFFFFF", // Tailwind: bg-white
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
    color: "#1F2937", // Tailwind: text-gray-800
    fontWeight: "500",
  },
  filterButtonTextInactive: {
    color: "#6B7280", // Tailwind: text-gray-500
    fontWeight: "500",
  },
});
