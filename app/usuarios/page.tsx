"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../context/AuthContext"
import Header from "../components/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Edit, Trash2, Loader2, CheckCircle, UserPlus, ArrowLeft } from "lucide-react"
import { saveUserPassword } from "../context/AuthContext"

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
const defaultUsuarios = [
  {
    id: "1",
    nombre: "Juan",
    apellido: "Pérez",
    documento: "12345678A",
    telefono: "+34 600 123 456",
    email: "admin@crm.com",
    rol: "dueño",
    fechaCreacion: "2024-01-01",
  },
  {
    id: "2",
    nombre: "María",
    apellido: "García",
    documento: "87654321B",
    telefono: "+34 600 654 321",
    email: "supervisor@crm.com",
    rol: "supervisor",
    fechaCreacion: "2024-01-05",
  },
  {
    id: "3",
    nombre: "Carlos",
    apellido: "López",
    documento: "11223344C",
    telefono: "+34 600 789 012",
    email: "asesor@crm.com",
    rol: "asesor",
    fechaCreacion: "2024-01-10",
  },
]

interface Usuario {
  id: string
  nombre: string
  apellido: string
  documento: string
  telefono: string
  email: string
  rol: "dueño" | "supervisor" | "asesor"
  fechaCreacion: string
}

// Función para generar ID único
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

export default function UsuariosPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Estado con persistencia en localStorage
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => loadFromLocalStorage("crm-usuarios", defaultUsuarios))
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    telefono: "",
    email: "",
    password: "",
    confirmPassword: "",
    rol: "asesor" as const,
  })
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [successMessage, setSuccessMessage] = useState("")

  // Guardar usuarios automáticamente cuando cambien
  useEffect(() => {
    saveToLocalStorage("crm-usuarios", usuarios)
  }, [usuarios])

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (user.rol !== "dueño" && user.rol !== "supervisor") {
        // Solo dueños y supervisores pueden acceder a esta página
        router.push("/clientes")
      }
    }
  }, [user, loading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Limpiar error cuando el usuario comienza a escribir
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!formData.nombre.trim()) errors.nombre = "El nombre es obligatorio"
    if (!formData.apellido.trim()) errors.apellido = "El apellido es obligatorio"
    if (!formData.documento.trim()) errors.documento = "El número de cédula es obligatorio"
    if (!formData.telefono.trim()) errors.telefono = "El teléfono es obligatorio"

    if (!formData.email.trim()) {
      errors.email = "El correo es obligatorio"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Formato de correo inválido"
    } else if (!isEditDialogOpen && usuarios.some((u) => u.email === formData.email)) {
      errors.email = "Este correo ya está registrado"
    }

    if (!isEditDialogOpen) {
      if (!formData.password) {
        errors.password = "La contraseña es obligatoria"
      } else if (formData.password.length < 6) {
        errors.password = "La contraseña debe tener al menos 6 caracteres"
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden"
      }
    }

    return errors
  }

  const handleCreateUser = () => {
    const errors = validateForm()

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const newUser: Usuario = {
      id: generateId(),
      nombre: formData.nombre,
      apellido: formData.apellido,
      documento: formData.documento,
      telefono: formData.telefono,
      email: formData.email,
      rol: formData.rol,
      fechaCreacion: new Date().toISOString().split("T")[0],
    }

    // Agregar el nuevo usuario a la lista
    setUsuarios([...usuarios, newUser])

    // Actualizar el mockUsers en AuthContext para que el nuevo usuario pueda iniciar sesión
    const mockUsers = loadFromLocalStorage("crm-mockUsers", [])
    const newAuthUser = {
      id: newUser.id,
      nombre: `${newUser.nombre} ${newUser.apellido}`,
      email: newUser.email,
      rol: newUser.rol,
    }
    mockUsers.push(newAuthUser)
    saveToLocalStorage("crm-mockUsers", mockUsers)

    // Guardar la contraseña del nuevo usuario
    saveUserPassword(formData.email, formData.password)

    // Mostrar mensaje de éxito
    setSuccessMessage(
      `Usuario ${newUser.nombre} ${newUser.apellido} creado exitosamente. Puede iniciar sesión con su correo y contraseña.`,
    )
    setTimeout(() => setSuccessMessage(""), 7000)

    // Cerrar el diálogo y resetear el formulario
    setIsDialogOpen(false)
    setFormData({
      nombre: "",
      apellido: "",
      documento: "",
      telefono: "",
      email: "",
      password: "",
      confirmPassword: "",
      rol: "asesor",
    })
    setFormErrors({})
  }

  const handleEditUser = () => {
    if (!editingUser) return

    const errors = validateForm()

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    // Actualizar el usuario
    const updatedUsuarios = usuarios.map((usuario) =>
      usuario.id === editingUser.id
        ? {
            ...usuario,
            nombre: formData.nombre,
            apellido: formData.apellido,
            documento: formData.documento,
            telefono: formData.telefono,
            email: formData.email,
            rol: formData.rol,
          }
        : usuario,
    )

    setUsuarios(updatedUsuarios)

    // Actualizar también en mockUsers para mantener la coherencia
    const mockUsers = loadFromLocalStorage("crm-mockUsers", [])
    const updatedMockUsers = mockUsers.map((u: any) =>
      u.id === editingUser.id
        ? {
            ...u,
            nombre: `${formData.nombre} ${formData.apellido}`,
            email: formData.email,
            rol: formData.rol,
          }
        : u,
    )
    saveToLocalStorage("crm-mockUsers", updatedMockUsers)

    // Si se cambió el email, actualizar las contraseñas también
    if (editingUser.email !== formData.email) {
      const userPasswords = loadFromLocalStorage("crm-userPasswords", {})
      const oldPassword = userPasswords[editingUser.email]
      delete userPasswords[editingUser.email]
      userPasswords[formData.email] = oldPassword
      saveToLocalStorage("crm-userPasswords", userPasswords)
    }

    // Mostrar mensaje de éxito
    setSuccessMessage(`Usuario ${formData.nombre} ${formData.apellido} actualizado exitosamente`)
    setTimeout(() => setSuccessMessage(""), 5000)

    // Cerrar el diálogo y resetear
    setIsEditDialogOpen(false)
    setEditingUser(null)
    setFormErrors({})
  }

  const openEditDialog = (usuario: Usuario) => {
    setEditingUser(usuario)
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      documento: usuario.documento,
      telefono: usuario.telefono,
      email: usuario.email,
      password: "",
      confirmPassword: "",
      rol: usuario.rol,
    })
    setFormErrors({})
    setIsEditDialogOpen(true)
  }

  const handleDeleteUser = (userId: string) => {
    // Confirmar antes de eliminar
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      // No permitir eliminar al usuario actual
      if (user && user.id === userId) {
        alert("No puedes eliminar tu propio usuario")
        return
      }

      // Encontrar el usuario a eliminar para obtener su email
      const userToDelete = usuarios.find((u) => u.id === userId)

      // Eliminar el usuario de la lista de usuarios
      const updatedUsuarios = usuarios.filter((usuario) => usuario.id !== userId)
      setUsuarios(updatedUsuarios)

      // Eliminar el usuario de mockUsers
      const mockUsers = loadFromLocalStorage("crm-mockUsers", [])
      const updatedMockUsers = mockUsers.filter((u: any) => u.id !== userId)
      saveToLocalStorage("crm-mockUsers", updatedMockUsers)

      // Eliminar la contraseña del usuario
      if (userToDelete) {
        const userPasswords = loadFromLocalStorage("crm-userPasswords", {})
        delete userPasswords[userToDelete.email]
        saveToLocalStorage("crm-userPasswords", userPasswords)
      }

      // Mostrar mensaje de éxito
      setSuccessMessage("Usuario eliminado exitosamente")
      setTimeout(() => setSuccessMessage(""), 5000)
    }
  }

  const handleGoBack = () => {
    router.push("/dashboard")
  }

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

  const filteredUsuarios = usuarios.filter((usuario) => {
    const searchString = `${usuario.nombre} ${usuario.apellido} ${usuario.email} ${usuario.documento}`.toLowerCase()
    return searchString.includes(searchTerm.toLowerCase())
  })

  const canManageAllUsers = user.rol === "dueño"
  const canManageAsesores = user.rol === "dueño" || user.rol === "supervisor"

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="outline" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">
            {user.rol === "dueño"
              ? "Administra todos los usuarios del sistema"
              : "Crea y administra cuentas de asesores"}
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Controls Section */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Create User Button */}
          {canManageAsesores && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="mr-2 h-4 w-4" />
                  {user.rol === "dueño" ? "Nuevo Usuario" : "Nuevo Asesor"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{user.rol === "dueño" ? "Crear Nuevo Usuario" : "Crear Cuenta de Asesor"}</DialogTitle>
                  <DialogDescription>
                    {user.rol === "dueño"
                      ? "Completa la información para crear un nuevo usuario del sistema."
                      : "Completa la información para crear una nueva cuenta de asesor."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className={formErrors.nombre ? "border-red-500" : ""}
                      />
                      {formErrors.nombre && <p className="text-xs text-red-500">{formErrors.nombre}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellido">Apellido *</Label>
                      <Input
                        id="apellido"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleInputChange}
                        className={formErrors.apellido ? "border-red-500" : ""}
                      />
                      {formErrors.apellido && <p className="text-xs text-red-500">{formErrors.apellido}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documento">Número de Cédula *</Label>
                    <Input
                      id="documento"
                      name="documento"
                      value={formData.documento}
                      onChange={handleInputChange}
                      className={formErrors.documento ? "border-red-500" : ""}
                    />
                    {formErrors.documento && <p className="text-xs text-red-500">{formErrors.documento}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      placeholder="+34 600 123 456"
                      className={formErrors.telefono ? "border-red-500" : ""}
                    />
                    {formErrors.telefono && <p className="text-xs text-red-500">{formErrors.telefono}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={formErrors.email ? "border-red-500" : ""}
                    />
                    {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña *</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={formErrors.password ? "border-red-500" : ""}
                      />
                      {formErrors.password && <p className="text-xs text-red-500">{formErrors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={formErrors.confirmPassword ? "border-red-500" : ""}
                      />
                      {formErrors.confirmPassword && (
                        <p className="text-xs text-red-500">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rol">Rol *</Label>
                    <select
                      id="rol"
                      name="rol"
                      className="w-full p-2 border rounded-md"
                      value={formData.rol}
                      onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                    >
                      {user.rol === "dueño" && (
                        <>
                          <option value="supervisor">Supervisor</option>
                          <option value="asesor">Asesor</option>
                        </>
                      )}
                      {user.rol === "supervisor" && <option value="asesor">Asesor</option>}
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setFormErrors({})
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700">
                    Crear {formData.rol === "asesor" ? "Asesor" : "Usuario"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios del Sistema</CardTitle>
            <CardDescription>
              {filteredUsuarios.length} usuario{filteredUsuarios.length !== 1 ? "s" : ""} encontrado
              {filteredUsuarios.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.map((usuario) => {
                  // Determinar si el usuario actual puede editar/eliminar este usuario
                  const canEdit = user.rol === "dueño" || (user.rol === "supervisor" && usuario.rol === "asesor")

                  return (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <div className="font-medium">
                          {usuario.nombre} {usuario.apellido}
                        </div>
                      </TableCell>
                      <TableCell>{usuario.documento}</TableCell>
                      <TableCell>{usuario.telefono}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            usuario.rol === "dueño"
                              ? "bg-purple-100 text-purple-800 border-purple-200"
                              : usuario.rol === "supervisor"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-green-100 text-green-800 border-green-200"
                          }
                        >
                          {usuario.rol}
                        </Badge>
                      </TableCell>
                      <TableCell>{usuario.fechaCreacion}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {canEdit && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(usuario)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              {usuario.id !== user.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteUser(usuario.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Modifica la información del usuario.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input id="edit-nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} />
                {formErrors.nombre && <p className="text-xs text-red-500">{formErrors.nombre}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-apellido">Apellido</Label>
                <Input id="edit-apellido" name="apellido" value={formData.apellido} onChange={handleInputChange} />
                {formErrors.apellido && <p className="text-xs text-red-500">{formErrors.apellido}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-documento">Número de Cédula</Label>
              <Input id="edit-documento" name="documento" value={formData.documento} onChange={handleInputChange} />
              {formErrors.documento && <p className="text-xs text-red-500">{formErrors.documento}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-telefono">Teléfono</Label>
              <Input id="edit-telefono" name="telefono" value={formData.telefono} onChange={handleInputChange} />
              {formErrors.telefono && <p className="text-xs text-red-500">{formErrors.telefono}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Correo Electrónico</Label>
              <Input id="edit-email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
              {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
            </div>

            {user.rol === "dueño" && editingUser && editingUser.rol !== "dueño" && (
              <div className="space-y-2">
                <Label htmlFor="edit-rol">Rol</Label>
                <select
                  id="edit-rol"
                  name="rol"
                  className="w-full p-2 border rounded-md"
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                >
                  <option value="supervisor">Supervisor</option>
                  <option value="asesor">Asesor</option>
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setFormErrors({})
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditUser}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
