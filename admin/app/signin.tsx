import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "@/context/ctx";
import { Feather, Fontisto } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const loginSchema = z.object({
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SignInScreen() {
  const { signIn, isLoading, signInError } = useSession();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    signIn(data);
  };

  const renderFieldError = (text: string) => (
    <View>
      <Text
        style={{
          marginTop: 8,
          color: "#ef4444",
          fontSize: 12,
          fontWeight: "500",
          marginLeft: 4,
        }}
      >
        {text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={["#ea580c", "#f97316", "#fb923c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: 24,
              paddingTop: 32,
              paddingBottom: 48,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 100,
                  height: 100,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: 50,
                  marginBottom: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 3,
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 12,
                }}
              >
                <Feather name="map-pin" color="#ffffff" size={40} />
              </View>
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "bold",
                  color: "#ffffff",
                  textShadowColor: "rgba(0, 0, 0, 0.2)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                }}
              >
                ParkPOS
              </Text>
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: 16,
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                Parking Management System
              </Text>
            </View>
          </LinearGradient>

          <View style={{ flex: 1, paddingHorizontal: 24, marginTop: -24 }}>
            <View
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 24,
                paddingVertical: 40,
                paddingHorizontal: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.1,
                shadowRadius: 32,
                elevation: 16,
              }}
            >
              <View style={{ alignItems: "center", marginBottom: 32 }}>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    color: "#1e293b",
                    marginBottom: 8,
                  }}
                >
                  Admin Login
                </Text>
                <Text
                  style={{
                    color: "#64748b",
                    textAlign: "center",
                    fontSize: 16,
                  }}
                >
                  Access your parking dashboard
                </Text>
              </View>

              <View style={{ gap: 24 }}>
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: 8,
                      marginLeft: 4,
                    }}
                  >
                    Email Address
                  </Text>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View
                        className={`flex-row items-center bg-slate-50 rounded-xl px-4 h-14 border ${
                          errors.email
                            ? "border-red-300 bg-red-50"
                            : "border-slate-200 focus:border-orange-400"
                        }`}
                      >
                        <View className="w-8 items-center">
                          <Fontisto
                            name="email"
                            color={errors.email ? "#ef4444" : "#64748b"}
                            size={16}
                          />
                        </View>
                        <TextInput
                          autoCapitalize="none"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          placeholderTextColor="#94a3b8"
                          className="flex-1 ml-3 text-base text-slate-800 font-medium"
                          placeholder="staff@parkpos.com"
                        />
                      </View>
                    )}
                  />
                  {errors.email?.message &&
                    renderFieldError(errors.email.message)}
                </View>

                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: 8,
                      marginLeft: 4,
                    }}
                  >
                    Password
                  </Text>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View
                        className={`flex-row items-center bg-slate-50 rounded-xl px-4 h-14 border ${
                          errors.password
                            ? "border-red-300 bg-red-50"
                            : "border-slate-200 focus:border-orange-400"
                        }`}
                      >
                        <View className="w-8 items-center">
                          <Feather
                            name="lock"
                            color={errors.password ? "#ef4444" : "#64748b"}
                            size={16}
                          />
                        </View>
                        <TextInput
                          secureTextEntry={!passwordVisible}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          placeholderTextColor="#94a3b8"
                          className="flex-1 ml-3 text-base text-slate-800 font-medium"
                          placeholder="Enter your password"
                        />
                        <TouchableOpacity
                          onPress={() => setPasswordVisible(!passwordVisible)}
                          className="w-8 items-center justify-center"
                        >
                          <Feather
                            name={passwordVisible ? "eye-off" : "eye"}
                            color="#64748b"
                            size={16}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  {errors.password?.message &&
                    renderFieldError(errors.password.message)}
                </View>
              </View>

              {signInError && (
                <View
                  style={{
                    backgroundColor: "#fef2f2",
                    borderLeftWidth: 4,
                    borderLeftColor: "#ef4444",
                    padding: 16,
                    marginTop: 24,
                    borderRadius: 12,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Feather name="alert-circle" color="#ef4444" size={18} />
                    <Text
                      style={{
                        color: "#dc2626",
                        fontSize: 14,
                        fontWeight: "500",
                        marginLeft: 8,
                        flex: 1,
                      }}
                    >
                      {signInError}
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={{
                  backgroundColor: isLoading ? "#94a3b8" : "#f97316",
                  paddingVertical: 18,
                  borderRadius: 16,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 32,
                  shadowColor: "#f97316",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isLoading ? 0 : 0.3,
                  shadowRadius: 16,
                  elevation: isLoading ? 0 : 8,
                  transform: [{ scale: isLoading ? 0.98 : 1 }],
                }}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text
                      style={{
                        color: "#ffffff",
                        fontSize: 16,
                        fontWeight: "600",
                        marginLeft: 12,
                      }}
                    >
                      Signing In...
                    </Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Feather name="log-in" color="white" size={20} />
                    <Text
                      style={{
                        color: "#ffffff",
                        fontSize: 16,
                        fontWeight: "600",
                        marginLeft: 12,
                      }}
                    >
                      Log in to Dashboard
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <View
                style={{
                  marginTop: 32,
                  paddingTop: 24,
                  borderTopWidth: 1,
                  borderTopColor: "#f1f5f9",
                }}
              >
                <View style={{ alignItems: "center", marginTop: 16 }}>
                  <Text
                    style={{
                      color: "#94a3b8",
                      fontSize: 12,
                      textAlign: "center",
                    }}
                  >
                    🔐 Secure Login • Version 2.1.0
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
