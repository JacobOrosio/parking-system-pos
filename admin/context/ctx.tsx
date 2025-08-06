import React, { useState, useContext, createContext, useCallback } from "react";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useStorageState } from "@/hooks/useStorageState";
import { signIn } from "@/api/mutations/auth";
import { fetchUserProfile } from "@/api/queries/auth";
import { User } from "@/types/user";

interface Credentials {
  email: string;
  password: string;
}

interface AuthContextProps {
  signIn: (credentials: Credentials) => void;
  signOut: () => void;
  isLoading: boolean;
  signInError: string | null;
  user: User | null;
}

const AuthContext = createContext<AuthContextProps>({
  signIn: () => null,
  signOut: () => null,
  isLoading: false,
  signInError: null,
  user: null,
});

export function useSession(): AuthContextProps {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <AuthProvider />");
    }
  }
  return value;
}

export const SessionProvider: React.FC<React.PropsWithChildren> = (props) => {
  const [[isLoading, session], setSession] = useStorageState("session"); // Note: we can use useStorageState at any other use case
  const [signInError, setSignInError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const token = session ? JSON.parse(session)?.token : null;

  const { mutate, isPending } = useMutation({
    mutationFn: signIn,
    onSuccess(data) {
      setSession(JSON.stringify(data));
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.push("/(tabs)/home");
    },
    onError(error) {
      setSignInError(error.message);
    },
  });

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchUserProfile,
    enabled: !!token,
    retry: false,
  });

  const signOut = useCallback(async () => {
    try {
      setSession(null);
      queryClient.removeQueries({ queryKey: ["profile"] });
      router.replace("/signin");
    } catch (error) {
      console.error("Error during signOut:", error);
    }
  }, [setSession]);

  const handleSignIn = (credentials: Credentials) => {
    mutate({
      email: credentials.email,
      password: credentials.password,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        signIn: handleSignIn,
        signOut,
        user: profile ?? null,
        isLoading: isPending || isLoading || loadingProfile,
        signInError,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};
