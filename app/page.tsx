"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./context/AuthContext"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (user.rol === "dueño" || user.rol === "supervisor") {
        router.push("/dashboard")
      } else if (user.rol === "asesor") {
        router.push("/clientes")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return null
}
