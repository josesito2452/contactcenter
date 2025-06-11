"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../context/AuthContext"
import Header from "../components/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  Phone,
  Mail,
  CheckCircle,
  Loader2,
  UserPlus,
  Settings,
} from "lucide-react"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || (user.rol !== "dueño" && user.rol !== "supervisor"))) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || (user.rol !== "dueño" && user.rol !== "supervisor")) {
    return null
  }

  const stats = [
    {
      title: "Total Clientes",
      value: "1,234",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Ventas del Mes",
      value: "$45,678",
      change: "+8%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Conversión",
      value: "23.5%",
      change: "+2.1%",
      icon: Target,
      color: "text-purple-600",
    },
    {
      title: "Crecimiento",
      value: "18.2%",
      change: "+5.4%",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: "call",
      description: "Llamada con cliente ABC Corp",
      time: "Hace 2 horas",
      status: "completed",
    },
    {
      id: 2,
      type: "email",
      description: "Email enviado a prospecto XYZ",
      time: "Hace 4 horas",
      status: "sent",
    },
    {
      id: 3,
      type: "meeting",
      description: "Reunión programada con cliente DEF",
      time: "Mañana 10:00 AM",
      status: "scheduled",
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "call":
        return Phone
      case "email":
        return Mail
      case "meeting":
        return Calendar
      default:
        return CheckCircle
    }
  }

  const handleNavigateToUsers = () => {
    router.push("/usuarios")
  }

  const handleNavigateToClients = () => {
    router.push("/clientes")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Bienvenido de vuelta, {user?.nombre}</p>
          <Badge variant="secondary" className="mt-2 capitalize">
            {user?.rol}
          </Badge>
        </div>

        {/* Quick Actions for User Management */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleNavigateToUsers}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <UserPlus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Gestionar Usuarios</h3>
                    <p className="text-sm text-gray-600">
                      {user.rol === "dueño" ? "Crear supervisores y asesores" : "Crear cuentas de asesores"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleNavigateToClients}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Gestionar Clientes</h3>
                    <p className="text-sm text-gray-600">Ver y administrar la cartera de clientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Configuración</h3>
                    <p className="text-sm text-gray-600">Ajustes del sistema y preferencias</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-green-600 font-medium">{stat.change} desde el mes pasado</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Actividades Recientes</CardTitle>
              <CardDescription>Últimas interacciones con clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type)
                  return (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Icon className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                      <Badge variant={activity.status === "completed" ? "default" : "secondary"}>
                        {activity.status}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Management Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Equipo</CardTitle>
              <CardDescription>Administra tu equipo de trabajo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-800">Crear Cuenta de Asesor</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        {user.rol === "dueño"
                          ? "Agrega nuevos supervisores o asesores al equipo"
                          : "Agrega nuevos asesores a tu equipo"}
                      </p>
                    </div>
                    <Button onClick={handleNavigateToUsers} size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Crear
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-green-800">Gestionar Clientes</h4>
                      <p className="text-sm text-green-700 mt-1">Administra la cartera de clientes y prospectos</p>
                    </div>
                    <Button onClick={handleNavigateToClients} size="sm" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800">Recordatorio</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    {user.rol === "dueño"
                      ? "Tienes permisos completos para gestionar todo el sistema"
                      : "Puedes crear y gestionar cuentas de asesores"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
