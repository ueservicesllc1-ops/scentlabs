"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { customerService } from "@/lib/firestore/customers";
import { Customer, UserRole } from "@/types/customer";
import { logger } from "@/lib/logger";

interface AuthContextType {
  user: User | null;
  profile: Customer | null;
  role: UserRole;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, pass: string, name?: string, brand?: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Customer | null>(null);
  const [role, setRole] = useState<UserRole>("customer");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const custProfile = await customerService.getProfile(firebaseUser.uid);
          if (custProfile) {
            setProfile(custProfile);
            setRole(custProfile.role || "customer");
          } else {
            // New user without doc yet
            const defaultRole: UserRole = firebaseUser.email?.includes("admin") ? "admin" : "customer";
            setRole(defaultRole);
          }
        } catch (error) {
          logger.error("Failed to load customer profile", error);
        }
      } else {
        setProfile(null);
        setRole("customer");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (email: string, pass: string, name?: string, brand?: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    
    // Create initial profile in Firestore
    const newCustomer: Customer = {
      id: cred.user.uid,
      firebaseUid: cred.user.uid,
      email: cred.user.email || email,
      displayName: name || "",
      businessName: brand || "",
      role: email.includes("admin") ? "admin" : "customer",
      addresses: [],
      savedDesignIds: [],
      totalOrdersCount: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await customerService.saveProfile(newCustomer);
    setProfile(newCustomer);
    setRole(newCustomer.role);
  };

  const loginWithGoogle = async () => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setRole("customer");
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        login,
        loginWithEmail: login,
        loginWithGoogle,
        register,
        registerWithEmail: register,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
