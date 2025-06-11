"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../context/AuthContext"
import Header from "../components/Header"
import TipificacionStats from "../components/TipificacionStats"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Plus, Upload, Download, Phone, Mail, Eye, Edit, Trash2, Loader2, CheckCircle } from "lucide-react"
import { processExcelData } from "@/lib/excel"
import { generateId } from "@/lib/utils"

// Función para descargar Excel/CSV
const downloadExcel = (data: Cliente[], fileName: string) => {
  // Crear los datos para el Excel
  const excelData = data.map((cliente, index) => ({
    "No.": index + 1,
    Cliente: cliente.nombre,
    Número: cliente.numero,
    Notas: cliente.notas,
    Tipificación: cliente.tipificacion,
    Estado: cliente.estado,
    "Último Contacto": cliente.ultimoContacto,
    "Hora Contacto": cliente.horaContacto,
    "Asesor Asignado": cliente.asesorAsignado,
  }))

  // Crear el contenido CSV
  const headers = Object.keys(excelData[0] || {})
  const csvContent = [
    headers.join(","),
    ...excelData.map((row) =>
      headers
        .map((header) => {
          const value = row[header as keyof typeof row]
          // Escapar comillas y envolver en comillas si contiene comas
          return typeof value === "string" && (value.includes(",") || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value
        })
        .join(","),
    ),
  ].join("\n")

  // Crear y descargar el archivo
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", fileName)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Función para guardar datos en localStorage
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

// Función para cargar datos desde localStorage
const loadFromLocalStorage = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  } catch (error) {
    console.error("Error loading from localStorage:", error)
    return defaultValue
  }
}

// Datos iniciales por defecto
const defaultClientes: Cliente[] = [
  {
    id: "1",
    nombre: "Ana García",
    numero: "+34 123 456 789",
    notas: "Cliente interesado en servicios premium. Requiere seguimiento personalizado.",
    tipificacion: "Call Back",
    estado: "cliente",
    ultimoContacto: "2024-01-20",
    horaContacto: "14:30",
    asesorAsignado: "Carlos López",
  },
  {
    id: "2",
    nombre: "Roberto Martínez",
    numero: "+34 987 654 321",
    notas: "Prospecto con alto potencial. Interesado en paquete empresarial.",
    tipificacion: "Processing",
    estado: "prospecto",
    ultimoContacto: "2024-01-19",
    horaContacto: "10:15",
    asesorAsignado: "María García",
  },
  {
    id: "3",
    nombre: "Laura Fernández",
    numero: "+34 555 123 456",
    notas: "No contestó últimas 3 llamadas. Intentar por email.",
    tipificacion: "Cancelled",
    estado: "inactivo",
    ultimoContacto: "2024-01-12",
    horaContacto: "16:45",
    asesorAsignado: "Carlos López",
  },
  {
    id: "4",
    nombre: "Carlos Ruiz",
    numero: "+34 666 777 888",
    notas: "Cliente pagó parcialmente. Pendiente segundo pago.",
    tipificacion: "Waiting for payment",
    estado: "cliente",
    ultimoContacto: "2024-01-18",
    horaContacto: "11:20",
    asesorAsignado: "Ana Martín",
  },
  {
    id: "5",
    nombre: "María López",
    numero: "+34 777 888 999",
    notas: "Pago completado. Cliente satisfecho con el servicio.",
    tipificacion: "Paid",
    estado: "cliente",
    ultimoContacto: "2024-01-21",
    horaContacto: "09:30",
    asesorAsignado: "Carlos López",
  },
]

interface Cliente {
  id: string
  nombre: string
  numero: string
  notas: string
  tipificacion: string
  estado: "cliente" | "prospecto" | "inactivo"
  ultimoContacto: string
  horaContacto: string
  asesorAsignado: string
}

const tipificaciones = [
  { value: "Processing", label: "Processing", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "Call Back", label: "Call Back", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "Cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-800 border-gray-200" },
  { value: "Sent to", label: "Sent to", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "Waiting for payment", label: "Waiting for payment", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  { value: "Paid", label: "Paid", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "Transfer", label: "Transfer", color: "bg-teal-100 text-teal-800 border-teal-200" },
  { value: "Return", label: "Return", color: "bg-pink-100 text-pink-800 border-pink-200" },
  { value: "Double", label: "Double", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "Spam/Errors", label: "Spam/Errors", color: "bg-red-100 text-red-800 border-red-200" },
]

const getTipificacionColor = (tipificacion: string) => {
  const tip = tipificaciones.find((t) => t.value === tipificacion)
  return tip ? tip.color : "bg-gray-100 text-gray-800 border-gray-200"
}

const handleCall = (numero: string, nombre: string) => {
  alert(`Llamando a ${nombre} al número ${numero}`)
}

const handleEmail = (nombre: string) => {
  alert(`Enviando correo a ${nombre}`)
}

export default function ClientesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Estado con persistencia en localStorage
  const [clientes, setClientes] = useState<Cliente[]>(() => loadFromLocalStorage("crm-clientes", defaultClientes))

  const [searchTerm, setSearchTerm] = useState(() => loadFromLocalStorage("crm-searchTerm", ""))

  const [filterStatus, setFilterStatus] = useState(() => loadFromLocalStorage("crm-filterStatus", "todos"))

  const [filterTipificacion, setFilterTipificacion] = useState(() =>
    loadFromLocalStorage("crm-filterTipificacion", "todos"),
  )

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTipDialogOpen, setIsTipDialogOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [selectedTipificacion, setSelectedTipificacion] = useState<string>("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Cliente | null>(null)
  const [editForm, setEditForm] = useState({ nombre: "", notas: "" })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadedCount, setUploadedCount] = useState(0)

  // Estado para el formulario de nuevo cliente/lead
  const [newClientForm, setNewClientForm] = useState({
    nombre: "",
    numero: "",
    notas: "",
    tipificacion: "",
    estado: "prospecto",
  })

  const filteredClientes = clientes.filter((cliente) => {
    const matchesSearch =
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.notas.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "todos" || cliente.estado === filterStatus

    // Si es asesor, no mostrar clientes con tipificación "Processing"
    const matchesTipificacion =
      (filterTipificacion === "todos" || cliente.tipificacion === filterTipificacion) &&
      !(user?.rol === "asesor" && cliente.tipificacion === "Processing")

    // Si es asesor, solo mostrar sus clientes asignados
    const matchesRole = user?.rol !== "asesor" || cliente.asesorAsignado === user.nombre

    return matchesSearch && matchesFilter && matchesTipificacion && matchesRole
  })

  const handleExport = () => {
    // Obtener los datos filtrados actuales
    const dataToExport = filteredClientes

    if (dataToExport.length === 0) {
      alert("No hay datos para exportar con los filtros actuales.")
      return
    }

    // Determinar el nombre del archivo basado en el filtro activo
    let fileName = "clientes_export"

    if (filterTipificacion !== "todos") {
      const tipificacionName = filterTipificacion.toLowerCase().replace(/\s+/g, "_")
      fileName = `clientes_${tipificacionName}`
    } else if (filterStatus !== "todos") {
      fileName = `clientes_${filterStatus}`
    }

    // Agregar fecha y hora al nombre del archivo
    const now = new Date()
    const dateStr = now.toISOString().split("T")[0]
    const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-")
    fileName += `_${dateStr}_${timeStr}.csv`

    // Descargar el archivo
    downloadExcel(dataToExport, fileName)

    // Mostrar mensaje de confirmación
    alert(
      `Exportando ${dataToExport.length} registros de ${filterTipificacion !== "todos" ? filterTipificacion : filterStatus !== "todos" ? filterStatus : "todos los clientes"}`,
    )
  }

  // Guardar clientes automáticamente cuando cambien
  useEffect(() => {
    saveToLocalStorage("crm-clientes", clientes)
  }, [clientes])

  // Guardar filtros automáticamente cuando cambien
  useEffect(() => {
    saveToLocalStorage("crm-searchTerm", searchTerm)
  }, [searchTerm])

  useEffect(() => {
    saveToLocalStorage("crm-filterStatus", filterStatus)
  }, [filterStatus])

  useEffect(() => {
    saveToLocalStorage("crm-filterTipificacion", filterTipificacion)
  }, [filterTipificacion])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Obtener tipificaciones disponibles según el rol del usuario
  const getAvailableTipificaciones = () => {
    if (user?.rol === "dueño" || user?.rol === "supervisor") {
      return tipificaciones
    } else {
      // Para asesores, filtrar "Processing"
      return tipificaciones.filter((tip) => tip.value !== "Processing")
    }
  }

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true)
      setUploadSuccess(false)

      try {
        // Procesar el archivo Excel
        const excelData = await processExcelData(file)

        // Convertir datos de Excel a formato de cliente
        const newClientes: Cliente[] = excelData.map((data) => ({
          id: generateId(),
          nombre: data.nombre,
          numero: data.numero,
          notas: data.notas,
          tipificacion: "Processing", // Todos los datos van a Processing
          estado: "prospecto" as const,
          ultimoContacto: new Date().toISOString().split("T")[0],
          horaContacto: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          asesorAsignado: user?.nombre || "Sin asignar",
        }))

        // Agregar nuevos clientes al estado
        const updatedClientes = [...clientes, ...newClientes]
        setClientes(updatedClientes)

        // Guardar inmediatamente en localStorage
        saveToLocalStorage("crm-clientes", updatedClientes)

        // Configurar estado de éxito
        setUploadedCount(newClientes.length)
        setUploadSuccess(true)

        // Filtrar automáticamente a Processing para mostrar los nuevos datos
        // Solo para dueños y supervisores
        if (user?.rol === "dueño" || user?.rol === "supervisor") {
          setFilterTipificacion("Processing")
          saveToLocalStorage("crm-filterTipificacion", "Processing")
        }

        // Limpiar el input file
        event.target.value = ""

        // Ocultar mensaje de éxito después de 5 segundos
        setTimeout(() => {
          setUploadSuccess(false)
        }, 5000)
      } catch (error) {
        console.error("Error procesando archivo Excel:", error)
        alert("Error al procesar el archivo Excel. Por favor, intenta de nuevo.")
      } finally {
        setIsUploading(false)
      }
    }
  }

  const openTipificacionDialog = (clienteId: string, tipificacion: string) => {
    setSelectedClientId(clienteId)
    setSelectedTipificacion(tipificacion)
    setIsTipDialogOpen(true)
  }

  const handleTipificacionChange = () => {
    if (selectedClientId && selectedTipificacion) {
      const updatedClientes = clientes.map((cliente) =>
        cliente.id === selectedClientId
          ? {
              ...cliente,
              tipificacion: selectedTipificacion,
              ultimoContacto: new Date().toISOString().split("T")[0],
              horaContacto: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
            }
          : cliente,
      )

      setClientes(updatedClientes)

      // Guardar inmediatamente en localStorage
      saveToLocalStorage("crm-clientes", updatedClientes)

      // Automatically filter to show the new tipification
      setFilterTipificacion(selectedTipificacion)
      saveToLocalStorage("crm-filterTipificacion", selectedTipificacion)

      setIsTipDialogOpen(false)
      setSelectedClientId(null)
    }
  }

  const handleTipificacionStatsClick = (tipificacion: string) => {
    // Si el usuario es asesor y la tipificación es "Processing", no hacer nada
    if (user?.rol === "asesor" && tipificacion === "Processing") {
      return
    }

    const newFilter = filterTipificacion === tipificacion ? "todos" : tipificacion
    setFilterTipificacion(newFilter)
    saveToLocalStorage("crm-filterTipificacion", newFilter)
  }

  const openEditDialog = (cliente: Cliente) => {
    setEditingClient(cliente)
    setEditForm({ nombre: cliente.nombre, notas: cliente.notas })
    setIsEditDialogOpen(true)
  }

  const handleEditSave = () => {
    if (editingClient) {
      const updatedClientes = clientes.map((cliente) =>
        cliente.id === editingClient.id
          ? {
              ...cliente,
              nombre: editForm.nombre,
              notas: editForm.notas,
              ultimoContacto: new Date().toISOString().split("T")[0],
              horaContacto: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
            }
          : cliente,
      )

      setClientes(updatedClientes)

      // Guardar inmediatamente en localStorage
      saveToLocalStorage("crm-clientes", updatedClientes)

      setIsEditDialogOpen(false)
      setEditingClient(null)
    }
  }

  const handleNewClientSave = () => {
    if (!newClientForm.nombre.trim() || !newClientForm.numero.trim()) {
      alert("Por favor completa al menos el nombre y número del cliente/lead.")
      return
    }

    const newCliente: Cliente = {
      id: generateId(),
      nombre: newClientForm.nombre,
      numero: newClientForm.numero,
      notas: newClientForm.notas,
      tipificacion: user?.rol === "asesor" ? "Call Back" : newClientForm.tipificacion || "Call Back",
      estado: user?.rol === "asesor" ? "prospecto" : (newClientForm.estado as any),
      ultimoContacto: new Date().toISOString().split("T")[0],
      horaContacto: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      asesorAsignado: user?.nombre || "Sin asignar",
    }

    setClientes((prevClientes) => [...prevClientes, newCliente])

    // Filtrar automáticamente a la tipificación del nuevo cliente
    if (user?.rol === "asesor") {
      // Para asesores, filtrar a "Call Back"
      setFilterTipificacion("Call Back")
      saveToLocalStorage("crm-filterTipificacion", "Call Back")
    } else if (newClientForm.tipificacion) {
      setFilterTipificacion(newClientForm.tipificacion)
      saveToLocalStorage("crm-filterTipificacion", newClientForm.tipificacion)
    }

    // Resetear formulario y cerrar diálogo
    setNewClientForm({
      nombre: "",
      numero: "",
      notas: "",
      tipificacion: "",
      estado: "prospecto",
    })
    setIsDialogOpen(false)
  }

  const handleEstadoChange = (clienteId: string, nuevoEstado: "cliente" | "prospecto" | "inactivo") => {
    const updatedClientes = clientes.map((cliente) =>
      cliente.id === clienteId
        ? {
            ...cliente,
            estado: nuevoEstado,
            ultimoContacto: new Date().toISOString().split("T")[0],
            horaContacto: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          }
        : cliente,
    )

    setClientes(updatedClientes)
    saveToLocalStorage("crm-clientes", updatedClientes)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "cliente":
        return "bg-green-100 text-green-800"
      case "prospecto":
        return "bg-yellow-100 text-yellow-800"
      case "inactivo":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Todos los usuarios pueden crear clientes/leads
  const canCreateClient = true
  const availableTipificaciones = getAvailableTipificaciones()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {user.rol === "asesor" ? "Gestión de Leads" : "Gestión de Clientes"}
          </h1>
          <p className="text-gray-600">
            Vista de {user.rol} - {filteredClientes.length} {user.rol === "asesor" ? "leads" : "clientes"} encontrados
          </p>
        </div>

        {/* Upload Success Alert */}
        {uploadSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ¡Éxito! Se han importado {uploadedCount} clientes y se han asignado automáticamente a "Processing".
            </AlertDescription>
          </Alert>
        )}

        {/* Tipification Stats */}
        <TipificacionStats
          clientes={clientes}
          onTipificacionClick={handleTipificacionStatsClick}
          selectedTipificacion={filterTipificacion}
          userRole={user.rol}
        />

        {/* Controls Section */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={user.rol === "asesor" ? "Buscar leads..." : "Buscar clientes..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="prospecto">Prospecto</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterTipificacion} onValueChange={setFilterTipificacion}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipificación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las tipificaciones</SelectItem>
                {availableTipificaciones.map((tip) => (
                  <SelectItem key={tip.value} value={tip.value}>
                    {tip.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Solo dueños y supervisores pueden subir Excel */}
            {(user.rol === "dueño" || user.rol === "supervisor") && (
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleExcelUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="excel-upload"
                  disabled={isUploading}
                />
                <Button variant="outline" asChild disabled={isUploading}>
                  <label htmlFor="excel-upload" className="cursor-pointer">
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Subir Excel
                      </>
                    )}
                  </label>
                </Button>
              </div>
            )}

            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>

            {canCreateClient && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {user?.rol === "asesor" ? "Nuevo Lead" : "Nuevo Cliente"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{user?.rol === "asesor" ? "Agregar Nuevo Lead" : "Agregar Nuevo Cliente"}</DialogTitle>
                    <DialogDescription>
                      {user?.rol === "asesor"
                        ? "Completa la información del nuevo lead/prospecto."
                        : "Completa la información del nuevo cliente."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="nombre" className="text-right">
                        Nombre *
                      </Label>
                      <Input
                        id="nombre"
                        value={newClientForm.nombre}
                        onChange={(e) => setNewClientForm({ ...newClientForm, nombre: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="numero" className="text-right">
                        Número *
                      </Label>
                      <Input
                        id="numero"
                        value={newClientForm.numero}
                        onChange={(e) => setNewClientForm({ ...newClientForm, numero: e.target.value })}
                        className="col-span-3"
                        placeholder="+34 600 123 456"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="notas" className="text-right">
                        Notas
                      </Label>
                      <Textarea
                        id="notas"
                        value={newClientForm.notas}
                        onChange={(e) => setNewClientForm({ ...newClientForm, notas: e.target.value })}
                        className="col-span-3"
                        placeholder="Información adicional sobre el lead/cliente..."
                      />
                    </div>

                    {/* Solo mostrar campos adicionales para dueños y supervisores */}
                    {user?.rol !== "asesor" && (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="tipificacion" className="text-right">
                            Tipificación
                          </Label>
                          <Select
                            value={newClientForm.tipificacion}
                            onValueChange={(value) => setNewClientForm({ ...newClientForm, tipificacion: value })}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Seleccionar tipificación" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTipificaciones.map((tip) => (
                                <SelectItem key={tip.value} value={tip.value}>
                                  {tip.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="estado" className="text-right">
                            Estado
                          </Label>
                          <Select
                            value={newClientForm.estado}
                            onValueChange={(value) => setNewClientForm({ ...newClientForm, estado: value })}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="prospecto">Prospecto</SelectItem>
                              <SelectItem value="cliente">Cliente</SelectItem>
                              <SelectItem value="inactivo">Inactivo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {/* Información para asesores */}
                    {user?.rol === "asesor" && (
                      <div className="col-span-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Nota:</strong> Los leads creados se asignarán automáticamente como "Prospecto" con
                          tipificación "Call Back" para su seguimiento.
                        </p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleNewClientSave}>
                      {user?.rol === "asesor" ? "Crear Lead" : "Guardar Cliente"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-600 uppercase text-xs tracking-wider">
                    {user.rol === "asesor" ? "Lead" : "Cliente"}
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 uppercase text-xs tracking-wider">Número</TableHead>
                  <TableHead className="font-semibold text-gray-600 uppercase text-xs tracking-wider">Notas</TableHead>
                  <TableHead className="font-semibold text-gray-600 uppercase text-xs tracking-wider">
                    Tipificación
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 uppercase text-xs tracking-wider">Estado</TableHead>
                  <TableHead className="font-semibold text-gray-600 uppercase text-xs tracking-wider">
                    Último Contacto
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 uppercase text-xs tracking-wider">
                    Hora Contacto
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 uppercase text-xs tracking-wider">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="font-medium text-gray-900">{cliente.nombre}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-700">{cliente.numero}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs text-sm text-gray-600 truncate" title={cliente.notas}>
                        {cliente.notas}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`cursor-pointer hover:opacity-80 ${getTipificacionColor(cliente.tipificacion)}`}
                        onClick={() => openTipificacionDialog(cliente.id, cliente.tipificacion)}
                      >
                        {cliente.tipificacion}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getEstadoColor(cliente.estado)}>
                        {cliente.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-600">{cliente.ultimoContacto}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-600">{cliente.horaContacto}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleCall(cliente.numero, cliente.nombre)}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => handleEmail(cliente.nombre)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => openEditDialog(cliente)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Tipificación Change Dialog */}
      <Dialog open={isTipDialogOpen} onOpenChange={setIsTipDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cambiar Tipificación</DialogTitle>
            <DialogDescription>
              Selecciona la nueva tipificación para este {user.rol === "asesor" ? "lead" : "cliente"}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-2 gap-2">
              {availableTipificaciones.map((tip) => (
                <Badge
                  key={tip.value}
                  variant="outline"
                  className={`p-3 cursor-pointer text-center ${tip.color} ${
                    selectedTipificacion === tip.value ? "ring-2 ring-offset-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedTipificacion(tip.value)}
                >
                  {tip.label}
                </Badge>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTipDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleTipificacionChange}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar {user.rol === "asesor" ? "Lead" : "Cliente"}</DialogTitle>
            <DialogDescription>
              Modifica la información del {user.rol === "asesor" ? "lead" : "cliente"}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-nombre" className="text-right">
                Nombre
              </Label>
              <Input
                id="edit-nombre"
                value={editForm.nombre}
                onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-notas" className="text-right">
                Notas
              </Label>
              <Textarea
                id="edit-notas"
                value={editForm.notas}
                onChange={(e) => setEditForm({ ...editForm, notas: e.target.value })}
                className="col-span-3"
                rows={4}
              />
            </div>
            {editingClient && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-sm text-gray-500">Información</Label>
                <div className="col-span-3 text-sm text-gray-600">
                  <p>Número: {editingClient.numero}</p>
                  <p>Estado: {editingClient.estado}</p>
                  <p>Tipificación: {editingClient.tipificacion}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSave}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
