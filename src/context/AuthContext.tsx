"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth, isMockMode } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAdmin: boolean;
  photoURL?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isMock: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Synchronize auth state
  useEffect(() => {
    if (isMockMode) {
      // Load user from localStorage in mock mode
      const savedUser = localStorage.getItem("careconnect_mock_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    } else {
      // Real firebase auth
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          const profile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            isAdmin: firebaseUser.email === "admin@careconnect.com" // Basic admin check
          };
          setUser(profile);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (isMockMode) {
      if (password.length < 6) throw new Error("Password must be at least 6 characters");
      const displayName = email.split("@")[0];
      const mockProfile: UserProfile = {
        uid: "mock-uid-" + Math.random().toString(36).substr(2, 9),
        email: email,
        displayName: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        isAdmin: email === "admin@careconnect.com",
        photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${displayName}`
      };
      localStorage.setItem("careconnect_mock_user", JSON.stringify(mockProfile));
      setUser(mockProfile);
      return;
    }

    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, name: string) => {
    if (isMockMode) {
      if (password.length < 6) throw new Error("Password must be at least 6 characters");
      const mockProfile: UserProfile = {
        uid: "mock-uid-" + Math.random().toString(36).substr(2, 9),
        email: email,
        displayName: name,
        isAdmin: email === "admin@careconnect.com",
        photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`
      };
      localStorage.setItem("careconnect_mock_user", JSON.stringify(mockProfile));
      setUser(mockProfile);
      return;
    }

    const credentials = await createUserWithEmailAndPassword(auth, email, password);
    // You could update profile name here if needed
    setUser({
      uid: credentials.user.uid,
      email: credentials.user.email,
      displayName: name,
      photoURL: credentials.user.photoURL,
      isAdmin: credentials.user.email === "admin@careconnect.com"
    });
  };

  const loginWithGoogle = async () => {
    if (isMockMode) {
      const mockProfile: UserProfile = {
        uid: "mock-google-uid-12345",
        email: "sarah.connor@gmail.com",
        displayName: "Sarah Connor",
        isAdmin: false,
        photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah"
      };
      localStorage.setItem("careconnect_mock_user", JSON.stringify(mockProfile));
      setUser(mockProfile);
      return;
    }

    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    if (isMockMode) {
      localStorage.removeItem("careconnect_mock_user");
      setUser(null);
      return;
    }

    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    if (isMockMode) {
      // Mock password reset
      console.log(`Password reset email simulated to ${email}`);
      return;
    }

    await sendPasswordResetEmail(auth, email);
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (isMockMode) {
      if (!user) return;
      const updatedProfile = { ...user, ...updates };
      localStorage.setItem("careconnect_mock_user", JSON.stringify(updatedProfile));
      setUser(updatedProfile);
      return;
    }
    
    if (auth.currentUser) {
      const { updateProfile } = await import("firebase/auth");
      await updateProfile(auth.currentUser, {
        displayName: updates.displayName !== undefined ? updates.displayName : auth.currentUser.displayName,
        photoURL: updates.photoURL !== undefined ? updates.photoURL : auth.currentUser.photoURL
      });
      setUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isMock: isMockMode, login, register, loginWithGoogle, logout, resetPassword, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
