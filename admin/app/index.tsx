import {
  TouchableOpacity,
  Alert,
  Text,
  SafeAreaView,
  View,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useSession } from "@/context/ctx";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function Index() {
  const router = useRouter();
  const { user } = useSession();
  const [isPressed, setIsPressed] = useState(false);

  const handleContinue = () => {
    if (user) {
      router.push("/(tabs)/home");
    } else {
      router.push("/signin");
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      <LinearGradient
        colors={["#1e40af", "#3b82f6", "#60a5fa"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 32,
              paddingBottom: 80,
            }}
          >
            {/* App Icon/Logo Area */}
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderRadius: 80,
                width: 160,
                height: 160,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 40,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <Ionicons name="scan" size={80} color="#ffffff" />
            </View>

            {/* App Title */}
            <Text
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: "#ffffff",
                textAlign: "center",
                marginBottom: 12,
                textShadowColor: "rgba(0, 0, 0, 0.3)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
            >
              Parking Ticket Scanner
            </Text>

            {/* Subtitle */}
            <Text
              style={{
                fontSize: 18,
                color: "rgba(255, 255, 255, 0.9)",
                textAlign: "center",
                marginBottom: 60,
                lineHeight: 24,
                paddingHorizontal: 20,
              }}
            >
              Scan and manage your parking tickets with ease
            </Text>

            {/* Continue Button */}
            <TouchableOpacity
              onPress={handleContinue}
              onPressIn={() => setIsPressed(true)}
              onPressOut={() => setIsPressed(false)}
              activeOpacity={0.8}
              style={{
                backgroundColor: isPressed
                  ? "rgba(255, 255, 255, 0.9)"
                  : "#ffffff",
                paddingHorizontal: 48,
                paddingVertical: 18,
                borderRadius: 30,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 15,
                elevation: 8,
                transform: [{ scale: isPressed ? 0.95 : 1 }],
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 200,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#1e40af",
                  marginRight: 8,
                }}
              >
                Get Started
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#1e40af" />
            </TouchableOpacity>

            {/* User Status Indicator */}
            <View
              style={{
                position: "absolute",
                bottom: 40,
                left: 0,
                right: 0,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "rgba(255, 255, 255, 0.7)",
                  textAlign: "center",
                }}
              >
                {user
                  ? "👋 Welcome back!"
                  : "✨ New here? Sign up to get started"}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}
