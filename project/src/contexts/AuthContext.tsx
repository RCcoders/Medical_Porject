import React, { createContext, useContext, useEffect, useState } from 'react'
import { Profile } from '../types/database.types'
import { login, register, getCurrentUser } from '../services/api'

interface AuthContextType {
  user: any | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, role: 'patient' | 'doctor' | 'researcher') => Promise<{ error: Error | null }>
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
        setProfile({
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role as 'patient' | 'doctor' | 'researcher',
          created_at: userData.created_at,
          updated_at: userData.updated_at,
          doctor_profile: userData.doctor_profile
        })
      } catch (error) {
        console.error('Failed to fetch user:', error)
        // --- FIX 1: Clear BOTH storages on failure ---
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        setUser(null)
        setProfile(null)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const refreshProfile = async () => {
    await checkAuth()
  }

  const signUp = async (email: string, password: string, fullName: string, role: 'patient' | 'doctor' | 'researcher') => {
    try {
      await register({ email, password, full_name: fullName, role })
      return { error: null }
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message
      return { error: new Error(message) }
    }
  }

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await login(formData);
      const token = response.access_token;

      // --- FIX 2: Ensure we don't have conflicting tokens ---
      if (rememberMe) {
        localStorage.setItem("token", token);
        sessionStorage.removeItem("token"); // Remove from session to avoid conflict
      } else {
        sessionStorage.setItem("token", token);
        localStorage.removeItem("token");   // Remove from local to avoid conflict
      }

      const userData = await getCurrentUser();
      setUser(userData);
      setProfile({
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role as "patient" | "doctor" | "researcher",
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        doctor_profile: userData.doctor_profile
      });

      return { error: null };
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message;
      return { error: new Error(message) };
    }
  };

  const signOut = async () => {
    // This part was already correct, but good to double check
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    setUser(null)
    setProfile(null)
  }

  const resetPassword = async (_email: string) => {
    return { error: null }
  }

  const updateProfile = async (_updates: Partial<Profile>) => {
    return { error: null }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}