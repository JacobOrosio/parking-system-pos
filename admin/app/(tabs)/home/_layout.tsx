import { CommonToast } from "@/components/toast";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

const Dashboard = () => {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <CommonToast />
    </SafeAreaProvider>
  );
};

export default Dashboard;
