import { updateUserStatus } from "@/api/mutations/user";
import { getUserStatus } from "@/api/queries/user";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  Text,
  SafeAreaView,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

type UserStatus = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | null;
  role: string | null;
};

export default function UserStatus() {
  const queryClient = useQueryClient();

  const {
    data: users,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["userStatus"],
    queryFn: () => getUserStatus(),
  });

  const mutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "active" | "inactive";
    }) => updateUserStatus({ id, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userStatus"] });
    },
  });

  const handleStatusChange = (id: string, newStatus: "active" | "inactive") => {
    mutation.mutate({ id, status: newStatus });
  };

  const renderUser = ({ item }: { item: UserStatus }) => (
    <View
      style={{
        backgroundColor: "white",
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>
          {item.name || "Unknown User"}
        </Text>
        <Text style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
          {item.email}
        </Text>
        <View
          style={{
            backgroundColor:
              item.status === "active"
                ? "#e8f5e8"
                : item.status === "inactive"
                  ? "#ffeaea"
                  : "#f0f0f0",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            alignSelf: "flex-start",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color:
                item.status === "active"
                  ? "#2d5a2d"
                  : item.status === "inactive"
                    ? "#8b0000"
                    : "#666",
            }}
          >
            Status: {item.status || "Unknown"}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: item.status === "active" ? "#ccc" : "#4CAF50",
            padding: 12,
            borderRadius: 6,
            alignItems: "center",
          }}
          onPress={() => handleStatusChange(item.id, "active")}
          disabled={item.status === "active" || mutation.isPending}
        >
          <Text
            style={{
              color: "white",
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {mutation.isPending &&
            mutation.variables?.id === item.id &&
            mutation.variables?.status === "active"
              ? "Activating..."
              : "Activate"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: item.status === "inactive" ? "#ccc" : "#f44336",
            padding: 12,
            borderRadius: 6,
            alignItems: "center",
          }}
          onPress={() => handleStatusChange(item.id, "inactive")}
          disabled={item.status === "inactive" || mutation.isPending}
        >
          <Text
            style={{
              color: "white",
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {mutation.isPending &&
            mutation.variables?.id === item.id &&
            mutation.variables?.status === "inactive"
              ? "Deactivating..."
              : "Deactivate"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={{ marginTop: 16, fontSize: 16, color: "#666" }}>
            Loading users...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f5f5f5" }}
      className="mt-10"
    >
      <View style={{ backgroundColor: "white", padding: 16, marginBottom: 8 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 4 }}>
          User Management
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#2196F3",
            padding: 12,
            borderRadius: 6,
            alignItems: "center",
            marginTop: 12,
          }}
          onPress={() => router.replace("/(tabs)/user/components/add-user")}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
            Add User
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 32,
            }}
          >
            <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
              No users found
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </SafeAreaView>
  );
}
