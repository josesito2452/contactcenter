"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TipificacionStatsProps {
  clientes: Array<{
    tipificacion: string
  }>
  onTipificacionClick: (tipificacion: string) => void
  selectedTipificacion: string
  userRole: "dueño" | "supervisor" | "asesor"
}

const tipificaciones = [
  { value: "Processing", label: "Processing", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "Call Back", label: "Call Back", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "Cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-800 border-gray-200" },
  { value: "Sent to", label: "Sent to", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "Waiting for payment", label: "Waiting for payment", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  { value: "Paid", label: "Paid", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "Transfer", label: "Transfer", color: "bg-teal-100 text-teal-800 border-teal-200" },
  { value: "Return", label: "Return", color: "bg-pink-100 text-pink-800 border-pink-200" },
  { value: "Double", label: "Double", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "Spam/Errors", label: "Spam/Errors", color: "bg-red-100 text-red-800 border-red-200" },
]

export default function TipificacionStats({
  clientes,
  onTipificacionClick,
  selectedTipificacion,
  userRole,
}: TipificacionStatsProps) {
  const getCount = (tipificacion: string) => {
    return clientes.filter((cliente) => cliente.tipificacion === tipificacion).length
  }

  // Filtrar tipificaciones según el rol del usuario
  const filteredTipificaciones = tipificaciones.filter((tip) => {
    // Si es dueño o supervisor, mostrar todas las tipificaciones
    if (userRole === "dueño" || userRole === "supervisor") {
      return true
    }
    // Si es asesor, no mostrar "Processing"
    return tip.value !== "Processing"
  })

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Estado de Tipificaciones</CardTitle>
        <CardDescription>Resumen de estados de clientes por tipificación</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {filteredTipificaciones.map((tip) => {
            const count = getCount(tip.value)
            const isSelected = selectedTipificacion === tip.value
            return (
              <Badge
                key={tip.value}
                variant="outline"
                className={`${tip.color} ${count === 0 ? "opacity-50" : ""} ${
                  isSelected ? "ring-2 ring-offset-2 ring-blue-500" : ""
                } px-3 py-1 text-sm font-medium cursor-pointer hover:opacity-80 transition-all`}
                onClick={() => onTipificacionClick(tip.value)}
              >
                {tip.label} {count > 0 && <span className="ml-1 font-bold">{count}</span>}
              </Badge>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
