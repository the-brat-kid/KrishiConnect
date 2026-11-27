"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "./api";
import { User, BusinessProfile } from "@/types";

interface AuthContextType {
  user: User | null;
  businessProfile: BusinessProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  loginWithOtp: (target: string | { phone?: string; email?: string }, otp: string, name?: string, role?: string) => Promise<void>;
  loginWithFirebasePhone: (idToken: string, phone: string, name?: string, role?: string) => Promise<void>;
  loginWithGoogle: (credentialOrToken: string, isAccessToken?: boolean) => Promise<void>;
  demoLogin: (role: "farmer" | "trader") => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const saveSession = (access_token: string, refresh_token: string, userData: any, profileData: any) => {
  if (typeof window === "undefined") return;
  if (access_token) localStorage.setItem("access_token", access_token);
  if (refresh_token) localStorage.setItem("refresh_token", refresh_token);
  if (userData) localStorage.setItem("kc_user", JSON.stringify(userData));
  if (profileData) localStorage.setItem("kc_profile", JSON.stringify(profileData));
};

const clearSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("kc_user");
  localStorage.removeItem("kc_profile");
};

const isPublicRoute = (pathname: string): boolean => {
  if (pathname === "/" || pathname === "") return true;
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) return true;
  if (pathname.startsWith("/pay/")) return true;
  if (
    pathname.startsWith("/contact") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/copyright")
  ) {
    return true;
  }
  return false;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize user & profile immediately from localStorage so state persists across tab/browser closes & reloads
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("kc_user");
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("kc_profile");
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (token) {
        try {
          const res = await api.get("/auth/me");
          if (res.data?.user) {
            setUser(res.data.user);
            setBusinessProfile(res.data.business_profile);
            saveSession(
              token,
              localStorage.getItem("refresh_token") || "",
              res.data.user,
              res.data.business_profile
            );
          }
        } catch (error: any) {
          console.warn("Auth check notice:", error?.message);
          // Only clear session if explicitly unauthenticated (401) and refresh token is absent
          if (error?.response?.status === 401 && !localStorage.getItem("refresh_token")) {
            clearSession();
            setUser(null);
            setBusinessProfile(null);
          }
        }
      } else {
        clearSession();
        setUser(null);
        setBusinessProfile(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const isPublic = isPublicRoute(pathname);
      if (!user && !isPublic) {
        router.push("/login");
      } else if (user && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (credentials: any) => {
    const res = await api.post("/auth/login", credentials);
    const { access_token, refresh_token, user: userData, business_profile } = res.data;
    saveSession(access_token, refresh_token, userData, business_profile);
    setUser(userData);
    setBusinessProfile(business_profile);
    router.push("/dashboard");
  };

  const loginWithOtp = async (target: string | { phone?: string; email?: string }, otp: string, name?: string, role?: string) => {
    let payload: any = { otp, name, role };
    if (typeof target === "string") {
      if (target.includes("@")) {
        payload.email = target.trim().toLowerCase();
      } else {
        payload.phone = target.replace(/\D/g, "").slice(-10);
      }
    } else {
      payload = { ...payload, ...target };
    }
    const res = await api.post("/auth/otp/verify", payload);
    const { access_token, refresh_token, user: userData, business_profile } = res.data;
    saveSession(access_token, refresh_token, userData, business_profile);
    setUser(userData);
    setBusinessProfile(business_profile);
    router.push("/dashboard");
  };

  const loginWithFirebasePhone = async (idToken: string, phone: string, name?: string, role?: string) => {
    const res = await api.post("/auth/firebase/verify", { id_token: idToken, phone, name, role });
    const { access_token, refresh_token, user: userData, business_profile } = res.data;
    saveSession(access_token, refresh_token, userData, business_profile);
    setUser(userData);
    setBusinessProfile(business_profile);
    router.push("/dashboard");
  };

  const loginWithGoogle = async (credentialOrToken: string, isAccessToken: boolean = false) => {
    const payload = isAccessToken
      ? { access_token: credentialOrToken }
      : { credential: credentialOrToken };
    const res = await api.post("/auth/google", payload);
    const { access_token, refresh_token, user: userData, business_profile } = res.data;
    saveSession(access_token, refresh_token, userData, business_profile);
    setUser(userData);
    setBusinessProfile(business_profile);
    router.push("/dashboard");
  };

  const demoLogin = async (role: "farmer" | "trader") => {
    const res = await api.post("/auth/demo-login", { role });
    const { access_token, refresh_token, user: userData, business_profile } = res.data;
    saveSession(access_token, refresh_token, userData, business_profile);
    setUser(userData);
    setBusinessProfile(business_profile);
    router.push("/dashboard");
  };

  const register = async (data: any) => {
    const res = await api.post("/auth/register", data);
    const { access_token, refresh_token, user: userData, business_profile } = res.data;
    saveSession(access_token, refresh_token, userData, business_profile);
    setUser(userData);
    setBusinessProfile(business_profile);
    router.push("/dashboard");
  };

  const logout = () => {
    clearSession();
    setUser(null);
    setBusinessProfile(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        businessProfile,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithOtp,
        loginWithFirebasePhone,
        loginWithGoogle,
        demoLogin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
