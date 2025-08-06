import {
  TouchableOpacity,
  Text,
  SafeAreaView,
  View,
  TextInput,
  ScrollView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useSession } from "@/context/ctx";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Feather, Fontisto } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { signUp } from "@/api/mutations/auth";
import { CommonToastShow } from "@/components/toast";

const loginSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["STAFF", "ADMIN"]).refine((val) => val !== undefined, {
    message: "Role is required",
  }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Index() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();
  const { signIn } = useSession();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "STAFF",
    },
  });

  const createUser = useMutation({
    mutationFn: signUp,
    onSuccess: async () => {
      CommonToastShow({
        title: "Create User",
        message: "Successfully created new user",
        type: "success",
      });
      reset();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Something went wrong.";
      CommonToastShow({
        title: "Create User",
        message: errorMessage,
        type: "error",
      });
    },
  });

  const renderFieldError = (text: string) => (
    <Text className="mt-2 text-red-500 text-sm font-medium">{text}</Text>
  );

  const onSubmit = async (data: LoginFormData) => {
    createUser.mutate(data);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-8 pb-6">
            <View className="mb-10">
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Add New User
              </Text>
              <Text className="text-gray-600 text-base leading-relaxed">
                Create a new account with secure access credentials
              </Text>
            </View>

            <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <View className="space-y-6">
                <View>
                  <Text className="text-gray-800 font-semibold mb-3 text-base">
                    Full Name
                  </Text>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View
                        className={`flex-row items-center bg-gray-50 rounded-2xl px-5 h-16 border-2 ${
                          errors.name
                            ? "border-red-300 bg-red-50"
                            : "border-transparent"
                        }`}
                      >
                        <View className="w-6 items-center mr-4">
                          <Feather
                            name="user"
                            color={errors.name ? "#ef4444" : "#6b7280"}
                            size={20}
                          />
                        </View>
                        <TextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          placeholderTextColor="#9ca3af"
                          className="flex-1 text-base text-gray-900 font-medium"
                          placeholder="Enter your full name"
                        />
                      </View>
                    )}
                  />
                  {errors.name?.message &&
                    renderFieldError(errors.name.message)}
                </View>

                <View>
                  <Text className="text-gray-800 font-semibold mb-3 text-base">
                    Email Address
                  </Text>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View
                        className={`flex-row items-center bg-gray-50 rounded-2xl px-5 h-16 border-2 ${
                          errors.email
                            ? "border-red-300 bg-red-50"
                            : "border-transparent"
                        }`}
                      >
                        <View className="w-6 items-center mr-4">
                          <Feather
                            name="mail"
                            color={errors.email ? "#ef4444" : "#6b7280"}
                            size={20}
                          />
                        </View>
                        <TextInput
                          autoCapitalize="none"
                          keyboardType="email-address"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          placeholderTextColor="#9ca3af"
                          className="flex-1 text-base text-gray-900 font-medium"
                          placeholder="staff@parkpos.com"
                        />
                      </View>
                    )}
                  />
                  {errors.email?.message &&
                    renderFieldError(errors.email.message)}
                </View>

                <View>
                  <Text className="text-gray-800 font-semibold mb-3 text-base">
                    Password
                  </Text>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View
                        className={`flex-row items-center bg-gray-50 rounded-2xl px-5 h-16 border-2 ${
                          errors.password
                            ? "border-red-300 bg-red-50"
                            : "border-transparent"
                        }`}
                      >
                        <View className="w-6 items-center mr-4">
                          <Feather
                            name="lock"
                            color={errors.password ? "#ef4444" : "#6b7280"}
                            size={20}
                          />
                        </View>
                        <TextInput
                          secureTextEntry={!passwordVisible}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          placeholderTextColor="#9ca3af"
                          className="flex-1 text-base text-gray-900 font-medium"
                          placeholder="Create a secure password"
                        />
                        <TouchableOpacity
                          onPress={() => setPasswordVisible(!passwordVisible)}
                          className="w-10 h-10 items-center justify-center rounded-xl"
                          activeOpacity={0.7}
                        >
                          <Feather
                            name={passwordVisible ? "eye-off" : "eye"}
                            color="#6b7280"
                            size={20}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  {errors.password?.message &&
                    renderFieldError(errors.password.message)}
                </View>

                <View>
                  <Text className="text-gray-800 font-semibold mb-3 text-base">
                    User Role
                  </Text>
                  <Controller
                    control={control}
                    name="role"
                    render={({ field: { value } }) => (
                      <View className="flex-row gap-4">
                        <TouchableOpacity
                          onPress={() => setValue("role", "STAFF")}
                          className={`flex-1 h-16 rounded-2xl justify-center items-center border-2 ${
                            value === "STAFF"
                              ? "bg-blue-500 border-blue-600"
                              : "bg-gray-50 border-gray-200"
                          }`}
                          activeOpacity={0.8}
                        >
                          <View className="flex-row items-center">
                            <Feather
                              name="users"
                              size={18}
                              color={value === "STAFF" ? "white" : "#6b7280"}
                              style={{ marginRight: 8 }}
                            />
                            <Text
                              className={`text-base font-bold ${
                                value === "STAFF"
                                  ? "text-white"
                                  : "text-gray-700"
                              }`}
                            >
                              Staff
                            </Text>
                          </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setValue("role", "ADMIN")}
                          className={`flex-1 h-16 rounded-2xl justify-center items-center border-2 ${
                            value === "ADMIN"
                              ? "bg-blue-500 border-blue-600"
                              : "bg-gray-50 border-gray-200"
                          }`}
                          activeOpacity={0.8}
                        >
                          <View className="flex-row items-center">
                            <Feather
                              name="shield"
                              size={18}
                              color={value === "ADMIN" ? "white" : "#6b7280"}
                              style={{ marginRight: 8 }}
                            />
                            <Text
                              className={`text-base font-bold ${
                                value === "ADMIN"
                                  ? "text-white"
                                  : "text-gray-700"
                              }`}
                            >
                              Admin
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  {errors.role?.message &&
                    renderFieldError(errors.role.message)}
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              className={`bg-green-400 rounded-2xl h-16 justify-center items-center mt-8 ${
                createUser.isPending ? "opacity-70" : ""
              }`}
              activeOpacity={0.9}
              disabled={createUser.isPending}
            >
              <View className="flex-row items-center">
                {createUser.isPending ? (
                  <Text className="text-white text-lg font-bold">
                    Creating User...
                  </Text>
                ) : (
                  <>
                    <Feather
                      name="plus-circle"
                      size={20}
                      color="white"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-white text-lg font-bold">
                      Create User Account
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
