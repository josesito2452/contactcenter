"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  nombre: string
  email: string
  rol: "dueño" | "supervisor" | "asesor"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Función para cargar datos desde localStorage
const loadFromLocalStorage = (key: string, defaultValue: any) => {
  try {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : defaultValue
    }
    return defaultValue
  } catch (error) {
    console.error("Error loading from localStorage:", error)
    return defaultValue
  }
}

// Función para guardar datos en localStorage
const saveToLocalStorage = (key: string, data: any) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data))
    }
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

// Usuarios de ejemplo para demostración
const defaultMockUsers: User[] = [
  { id: "1", nombre: "Juan Pérez", email: "admin@crm.com", rol: "dueño" },
  { id: "2", nombre: "María García", email: "supervisor@crm.com", rol: "supervisor" },
  { id: "3", nombre: "Carlos López", email: "asesor@crm.com", rol: "asesor" },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mockUsers, setMockUsers] = useState<User[]>([])

  useEffect(() => {
    // Cargar usuarios mock desde localStorage o usar los predeterminados
    const savedMockUsers = loadFromLocalStorage("crm-mockUsers", defaultMockUsers)
    setMockUsers(savedMockUsers)

    // Guardar los usuarios mock en localStorage si no existen
    if (!localStorage.getItem("crm-mockUsers")) {
      saveToLocalStorage("crm-mockUsers", defaultMockUsers)
    }

    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)

    // Simular llamada a API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Cargar usuarios actualizados desde localStorage
    const currentMockUsers = loadFromLocalStorage("crm-mockUsers", defaultMockUsers)
    const foundUser = currentMockUsers.find((u) => u.email === email)

    // Cargar las contraseñas de usuarios desde localStorage
    const userPasswords = loadFromLocalStorage("crm-userPasswords", {
      "admin@crm.com": "123456",
      "supervisor@crm.com": "123456",
      "asesor@crm.com": "123456",
    })

    if (foundUser && userPasswords[email] === password) {
      setUser(foundUser)
      localStorage.setItem("user", JSON.stringify(foundUser))
      setLoading(false)
      return true
    }

    setLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}

export const saveUserPassword = (email: string, password: string) => {
  const userPasswords = loadFromLocalStorage("crm-userPasswords", {
    "admin@crm.com": "123456",
    "supervisor@crm.com": "123456",
    "asesor@crm.com": "123456",
  })
  userPasswords[email] = password
  saveToLocalStorage("crm-userPasswords", userPasswords)
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
