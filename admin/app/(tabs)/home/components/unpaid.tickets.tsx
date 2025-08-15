import { getUnpaidTickets } from "@/api/queries/revenue";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";

const { width } = Dimensions.get("window");

export default function UnpaidTickets() {
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const {
    data: unpaidTickets,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["revenue", page],
    queryFn: () => getUnpaidTickets(),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  };

  const loadMore = useCallback(async () => {
    if (loadingMore || !unpaidTickets?.hasMore) return;

    setLoadingMore(true);
    setPage((prevPage) => prevPage + 1);
    setLoadingMore(false);
  }, [loadingMore, unpaidTickets?.hasMore]);

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getSeverityColor = (count: any) => {
    if (count >= 30)
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
      };
    if (count >= 15)
      return {
        bg: "bg-orange-100",
        text: "text-orange-800",
        border: "border-orange-200",
      };
    if (count >= 5)
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-200",
      };
    return {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
    };
  };

  const renderTicketItem = ({ item }: any) => {
    const severity = getSeverityColor(item.count);

    return (
      <View className="bg-white rounded-xl p-4 mb-3 mx-6 shadow-sm border border-gray-100">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View
              className={`w-3 h-3 rounded-full mr-3 ${item.count >= 20 ? "bg-red-500" : item.count >= 10 ? "bg-orange-500" : "bg-yellow-500"}`}
            />
            <Text className="text-gray-800 font-bold text-lg">
              {formatDate(item.date)}
            </Text>
          </View>

          <View
            className={`px-3 py-1 rounded-full border ${severity.bg} ${severity.border}`}
          >
            <Text className={`text-sm font-medium ${severity.text}`}>
              {item.count} tickets
            </Text>
          </View>
        </View>

        <View className="mt-3">
          <View className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <View
              className={`h-full rounded-full ${item.count >= 20 ? "bg-red-500" : item.count >= 10 ? "bg-orange-500" : "bg-yellow-500"}`}
              style={{ width: `${Math.min((item.count / 50) * 100, 100)}%` }}
            />
          </View>
          <Text className="text-gray-400 text-xs mt-1">
            {item.count >= 30
              ? "High Priority"
              : item.count >= 15
                ? "Medium Priority"
                : "Low Priority"}
          </Text>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#6366F1" />
        <Text className="text-gray-500 text-sm mt-2">Loading more...</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center px-6 py-12">
      <View className="bg-gray-100 p-6 rounded-full mb-4">
        <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
      </View>
      <Text className="text-gray-800 text-xl font-bold mb-2">
        No Unpaid Tickets
      </Text>
      <Text className="text-gray-500 text-center leading-6">
        Great! There are no unpaid tickets at the moment. Check back later or
        refresh to see updates.
      </Text>
    </View>
  );

  const ListHeader = () => (
    <View>
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
            <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
            <Text className="text-lg font-bold text-gray-800">
              Unpaid Tickets
            </Text>
          </View>
        </View>
      </View>

      <View className="px-5 mt-6 mb-6 ">
        <View className="bg-red-500 p-5 rounded-2xl w-full">
          <View className="flex-col items-center justify-between">
            <Text className="text-red-100 text-sm font-medium mb-1">
              Total Unpaid Tickets
            </Text>
            <Text className="text-white text-4xl font-bold">
              {unpaidTickets?.totalUnpaidTickets || 0}
            </Text>
            <Text className="text-red-100 text-sm mt-1">
              Across {unpaidTickets?.data?.length || 0} days
            </Text>
          </View>
        </View>
      </View>

      <View className="px-6 mb-4">
        <Text className="text-lg font-bold text-gray-800 mb-2">
          Recent Activity
        </Text>
        <View className="flex-row items-center">
          <View className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
          <Text className="text-gray-500 text-sm">
            Showing unpaid tickets by date
          </Text>
        </View>
      </View>
    </View>
  );

  if (isLoading && page === 1) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="mt-4 text-gray-600 text-lg">
            Loading unpaid tickets...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 mt-10 bg-gray-50">
      <FlatList
        data={unpaidTickets?.data || []}
        renderItem={renderTicketItem}
        keyExtractor={(item, index) => `${item.date}-${index}`}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6366F1"]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20,
        }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        getItemLayout={(data, index) => ({
          length: 120, // Approximate item height
          offset: 120 * index,
          index,
        })}
      />
    </SafeAreaView>
  );
}
