import React, { useEffect, useState } from "react";
import {
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import {
  ChevronLeft,
  Calendar,
  DollarSign,
  ChevronRight,
} from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { getUserTransactions } from "@/api/queries/revenue";

function ErrorBoundary({ children }: any) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, []);

  if (hasError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-red-500 text-center mb-4">
            Something went wrong. Please try again.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/home")}
            className="bg-blue-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  try {
    return children;
  } catch (err) {
    setHasError(true);
    console.error("ErrorBoundary caught:", err);
    return null;
  }
}

export default function UserTransaction() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-transactions", currentPage],
    queryFn: () => getUserTransactions({ page: currentPage, pageSize }),
  });

  // Debugging logs
  console.log("Query State:", { isLoading, error, response });
  console.log("Transactions:", response?.data);

  const transactions = response?.data || [];
  const pagination = {
    page: response?.page || 1,
    pageSize: response?.pageSize || 10,
    totalPages: response?.totalPages || 1,
    totalCount: response?.totalCount || 0,
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalAmount = () => {
    if (!transactions.length) return 0;
    return transactions.reduce(
      (sum: any, transaction: any) => sum + transaction.totalAmount,
      0
    );
  };

  const handleNextPage = () => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const renderTransactionItem = ({ item, index }: any) => {
    console.log("Rendering Item:", item);
    return (
      <View className="bg-white mx-4 mb-3 p-4 rounded-2xl shadow-sm border border-gray-100">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-1 capitalize">
              {item.user?.name || "Unknown User"}
            </Text>
            <View className="flex-row items-center mb-2">
              <Calendar size={16} color="#6B7280" />
              <Text className="text-gray-600 text-sm ml-2">
                {formatDate(item.sessionDate)}
              </Text>
            </View>
            <Text className="text-gray-400 text-xs">
              Transaction #{index + 1 + (currentPage - 1) * pageSize}
            </Text>
          </View>
          <View className="items-end">
            <View className="flex-row items-center">
              <Text className="text-[#10B981] text-2xl"> ₱</Text>
              <Text className="text-xl font-bold text-gray-900 ml-1">
                {item.totalAmount}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    console.log("UserTransaction Mounted");
    return () => console.log("UserTransaction Unmounted");
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-red-500 text-center mb-4">
            Error loading transactions: {error.message || "Unknown error"}
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/home")}
            className="bg-blue-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView className="flex-1 mt-10 bg-gray-50">
        <View className="bg-white px-4 py-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/home")}
              className="flex-row items-center"
            >
              <ChevronLeft size={24} color="#374151" />
              <Text className="text-gray-700 ml-2 font-medium">Back</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">
              Transactions
            </Text>
            <View className="w-16" />
          </View>
        </View>
        <View className="flex-1 mt-6">
          <View className="flex-row justify-between items-center mx-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </Text>
            <Text className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </Text>
          </View>

          {transactions.length > 0 ? (
            <>
              <FlatList
                data={transactions}
                renderItem={renderTransactionItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 80 }}
              />

              {pagination.totalPages > 1 && (
                <View className="bg-white mx-4 mb-4 p-4 rounded-2xl shadow-sm border border-gray-100">
                  <View className="flex-row justify-between items-center">
                    <TouchableOpacity
                      onPress={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`flex-row items-center px-4 py-2 rounded-xl ${
                        currentPage === 1 ? "bg-gray-100" : "bg-blue-500"
                      }`}
                    >
                      <ChevronLeft
                        size={16}
                        color={currentPage === 1 ? "#9CA3AF" : "#FFFFFF"}
                      />
                      <Text
                        className={`ml-1 font-medium ${
                          currentPage === 1 ? "text-gray-400" : "text-white"
                        }`}
                      >
                        Previous
                      </Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center">
                      <Text className="text-gray-600 text-sm">
                        {(currentPage - 1) * pageSize + 1}-
                        {Math.min(
                          currentPage * pageSize,
                          pagination.totalCount
                        )}{" "}
                        of {pagination.totalCount}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={handleNextPage}
                      disabled={currentPage === pagination.totalPages}
                      className={`flex-row items-center px-4 py-2 rounded-xl ${
                        currentPage === pagination.totalPages
                          ? "bg-gray-100"
                          : "bg-blue-500"
                      }`}
                    >
                      <Text
                        className={`mr-1 font-medium ${
                          currentPage === pagination.totalPages
                            ? "text-gray-400"
                            : "text-white"
                        }`}
                      >
                        Next
                      </Text>
                      <ChevronRight
                        size={16}
                        color={
                          currentPage === pagination.totalPages
                            ? "#9CA3AF"
                            : "#FFFFFF"
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View className="flex-1 justify-center items-center px-4">
              <Text className="text-gray-500 text-center mb-4">
                No transactions found
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
}
