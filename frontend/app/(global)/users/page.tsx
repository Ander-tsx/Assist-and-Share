"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/api"
import { User, Mail, Shield, Plus, Trash2, Edit2, Search, X, Briefcase, Lock, ChevronLeft, ChevronRight } from "lucide-react"
import { Toaster, toast } from "sonner"

import LoadingSpinner from "@/app/components/(ui)/LoadingSpinner"
import ErrorDisplay from "@/app/components/(ui)/ErrorDisplay"
import CustomSelect from "@/app/components/(ui)/CustomSelect"
import ConfirmationModal from "@/app/components/(ui)/ConfirmationModal"

interface UserData {
    _id: string
    first_name: string
    last_name: string
    email: string
    role: "attendee" | "presenter" | "admin"
    speciality?: string
}

export default function UsersPage() {
    const { user } = useAuth()

    // --- ESTADOS DE DATOS ---
    // 1. allUsers: Contiene TODA la base de datos (excluyendo admins)
    const [allUsers, setAllUsers] = useState<UserData[]>([])
    
    // 2. filteredUsers: Contiene los usuarios después de aplicar Búsqueda y Rol
    const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])

    // Estados de UI
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    
    // Filtros
    const [roleFilter, setRoleFilter] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    
    // Paginación (Ahora es local)
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 10 

    // Estados de Modales
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)

    // Formulario
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "presenter" as "attendee" | "presenter" | "admin",
        speciality: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const currentUserId = user ? (user as any)._id || (user as any).id : null

    // --- 1. CARGAR TODOS LOS USUARIOS (Una sola vez) ---
    const fetchAllUsers = async () => {
        setIsLoading(true)
        setError("")
        try {
            // Pedimos un límite muy alto para traer todo de golpe.
            // Si tu base de datos crece a más de 1000, aumenta este número o implementa scroll infinito.
            const { data } = await api.get(`/users?limit=1000`)
            
            const resultData = data.value.results || []
            
            // Quitamos a los admins del frontend
            const onlyNonAdmins = resultData.filter((u: UserData) => u.role !== 'admin')

            setAllUsers(onlyNonAdmins)
            setFilteredUsers(onlyNonAdmins) // Inicialmente, filtrados es igual a todos

        } catch (err: any) {
            console.error(err)
            setError("Error al cargar usuarios.")
            toast.error("No se pudieron cargar los usuarios")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (user?.role === "admin") {
            fetchAllUsers()
        }
    }, [user])

    // --- 2. LÓGICA DE FILTRADO Y BÚSQUEDA (Cliente) ---
    // Cada vez que cambie el texto o el rol, filtramos 'allUsers' y actualizamos 'filteredUsers'
    useEffect(() => {
        let result = allUsers

        // Filtro por Rol
        if (roleFilter !== "all") {
            result = result.filter(u => u.role === roleFilter)
        }

        // Filtro por Texto (Nombre, Apellido, Email)
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase()
            result = result.filter(u =>
                u.first_name.toLowerCase().includes(lowerTerm) ||
                (u.last_name && u.last_name.toLowerCase().includes(lowerTerm)) ||
                u.email.toLowerCase().includes(lowerTerm)
            )
        }

        setFilteredUsers(result)
        setCurrentPage(1) // Siempre volver a la página 1 al filtrar
    }, [allUsers, roleFilter, searchTerm])


    // --- 3. LÓGICA DE PAGINACIÓN (Cliente) ---
    // Calculamos qué usuarios mostrar en la página actual basándonos en 'filteredUsers'
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1
    
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        return filteredUsers.slice(startIndex, endIndex)
    }, [filteredUsers, currentPage])


    // --- Manejadores de Paginación ---
    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1)
    }

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1)
    }

    // --- Manejadores de Acciones ---
    const handleCreatePresenter = () => {
        setFormData({ first_name: "", last_name: "", email: "", password: "", role: "presenter", speciality: "" })
        setIsCreateModalOpen(true)
    }

    const handleEditUser = (userToEdit: UserData) => {
        setSelectedUser(userToEdit)
        setFormData({
            first_name: userToEdit.first_name,
            last_name: userToEdit.last_name,
            email: userToEdit.email,
            password: "",
            role: userToEdit.role,
            speciality: userToEdit.speciality || ""
        })
        setIsEditModalOpen(true)
    }

    const handleDeleteClick = (userToDelete: UserData) => {
        if (currentUserId === userToDelete._id) {
            toast.error("No puedes eliminar tu propia cuenta de administrador.")
            return
        }
        setSelectedUser(userToDelete)
        setIsDeleteModalOpen(true)
    }

    // --- Submits ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        const toastId = toast.loading(isEditModalOpen ? "Guardando cambios..." : "Creando usuario...")

        try {
            if (isEditModalOpen && selectedUser) {
                const updateData = { ...formData }
                if (!updateData.password) delete (updateData as any).password
                await api.put(`/users/${selectedUser._id}`, updateData)
                toast.success("Usuario actualizado", { id: toastId })
            } else {
                await api.post("/users", formData)
                toast.success("Usuario creado", { id: toastId })
            }
            setIsCreateModalOpen(false)
            setIsEditModalOpen(false)
            fetchAllUsers() // Recargar la lista completa
        } catch (err: any) {
            console.error(err)
            const errorMsg = err.response?.data?.message || "Error al procesar"
            toast.error(errorMsg, { id: toastId })
        } finally {
            setIsSubmitting(false)
        }
    }

    const executeDelete = async () => {
        if (!selectedUser) return
        setIsSubmitting(true)
        const toastId = toast.loading("Eliminando usuario...")
        try {
            await api.delete(`/users/${selectedUser._id}`)
            setIsDeleteModalOpen(false)
            fetchAllUsers() // Recargar la lista completa
            toast.success(`Usuario eliminado`, { id: toastId })
        } catch (err: any) {
            console.error(err)
            toast.error("Error al eliminar", { id: toastId })
        } finally {
            setIsSubmitting(false)
        }
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">Admin</span>
            case 'presenter': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">Ponente</span>
            default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">Asistente</span>
        }
    }

    if (user?.role !== "admin") {
        return <div className="min-h-screen flex items-center justify-center text-gray-500">Acceso Denegado</div>
    }

    return (
        <div className="min-h-screen text-white p-4 md:p-8" style={{ background: "linear-gradient(180deg, #1B293A 0%, #040711 10%)" }}>
            <Toaster richColors position="top-center" theme="dark" />

            <div className="max-w-7xl mx-auto pb-20">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-2">Usuarios</h1>
                        <p className="text-gray-400 text-sm">Gestión total ({allUsers.length} usuarios cargados)</p>
                    </div>

                    <button
                        onClick={handleCreatePresenter}
                        className="w-full md:w-auto bg-white text-black hover:bg-white/90 hover:rounded-3xl duration-300 hover:cursor-pointer px-6 py-3 rounded-xl font-base flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
                    >
                        Crear Ponente
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar usuario en la lista..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0B1121] border border-gray-800 rounded-xl pl-12 pr-4 py-2.5 text-white focus:border-blue-500 focus:outline-none placeholder-gray-600"
                        />
                    </div>
                    <div className="relative z-10">
                        <CustomSelect
                            value={roleFilter}
                            onChange={setRoleFilter}
                            options={[
                                { value: "all", label: "Todos los roles" },
                                { value: "attendee", label: "Asistentes" },
                                { value: "presenter", label: "Ponentes" },
                            ]}
                        />
                    </div>
                </div>

                {error && <ErrorDisplay message={error} />}

                <div className="bg-transparent md:bg-[#0B1121] md:border md:border-gray-800 rounded-2xl md:overflow-hidden md:shadow-xl flex flex-col min-h-[500px]">

                    {/* --- VISTA MÓVIL (Cards) --- */}
                    <div className="block md:hidden space-y-4 flex-grow">
                        {isLoading ? (<div className="flex justify-center p-8"><LoadingSpinner /></div>) : paginatedUsers.length === 0 ? (<div className="text-center p-8 text-gray-500">No hay coincidencias.</div>) : (
                            paginatedUsers.map((u) => {
                                const isSelf = currentUserId === u._id;
                                return (
                                    <div key={u._id} className="bg-[#0B1121] border border-gray-800 rounded-xl p-5 flex flex-col gap-4 shadow-lg">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-lg font-bold text-blue-400 border border-gray-700 shadow-inner">{u.first_name[0]}{u?.last_name?.[0]}</div>
                                                <div><div className="font-bold text-white text-lg">{u.first_name} {u.last_name}</div>{getRoleBadge(u.role)}</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-900/50 p-2 rounded-lg border border-gray-800/50"><Mail size={14} className="text-gray-500" /><span className="truncate">{u.email}</span></div>
                                            {u.speciality && (<div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-900/50 p-2 rounded-lg border border-gray-800/50"><Briefcase size={14} className="text-gray-500" /><span className="truncate">{u.speciality}</span></div>)}
                                        </div>
                                        <div className="flex gap-3 pt-2 border-t border-gray-800">
                                            <button onClick={() => handleEditUser(u)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 py-2 rounded-lg text-sm font-base flex items-center justify-center gap-2 hover:cursor-pointer">
                                                <Edit2 size={16} /> Editar
                                            </button>
                                            <button onClick={() => handleDeleteClick(u)} disabled={isSelf} className={`flex-1 py-2 rounded-lg text-sm font-base flex items-center justify-center gap-2 transition-all ${isSelf ? "bg-gray-800/30 text-gray-600 border border-gray-800 cursor-not-allowed" : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:cursor-pointer"}`}>
                                                {isSelf ? <Lock size={16} /> : <Trash2 size={16} />}
                                                {isSelf ? "Bloqueado" : "Eliminar"}
                                            </button>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* --- VISTA ESCRITORIO (Tabla) --- */}
                    <div className="hidden md:block overflow-x-auto flex-grow">
                        <table className="w-full text-left border-collapse">
                            <thead><tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider bg-gray-900/20"><th className="p-4 font-medium">Usuario</th><th className="p-4 font-medium">Rol</th><th className="p-4 font-medium">Especialidad</th><th className="p-4 font-medium text-right">Acciones</th></tr></thead>
                            <tbody className="divide-y divide-gray-800">
                                {isLoading ? (<tr><td colSpan={4} className="p-8"><LoadingSpinner /></td></tr>) : paginatedUsers.length === 0 ? (<tr><td colSpan={4} className="p-12 text-center text-gray-500">No se encontraron usuarios.</td></tr>) : (
                                    paginatedUsers.map((u) => {
                                        const isSelf = currentUserId === u._id;
                                        return (
                                            <tr key={u._id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-blue-400 border border-gray-700">{u.first_name[0]}{u?.last_name?.[0]}</div><div><div className="font-medium text-white">{u.first_name} {u.last_name}</div><div className="text-xs text-gray-500 flex items-center gap-1 hover:cursor-pointer"><Mail size={10} /> {u.email}</div></div></div></td>
                                                <td className="p-4">{getRoleBadge(u.role)}</td>
                                                <td className="p-4 text-sm text-gray-400">{u.speciality || "-"}</td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleEditUser(u)} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors hover:cursor-pointer" title="Editar"><Edit2 size={16} /></button>
                                                        {isSelf ? (
                                                            <button disabled className="p-2 rounded-lg text-gray-700 cursor-not-allowed" title="No puedes eliminar tu propia cuenta"><Shield size={16} /></button>
                                                        ) : (
                                                            <button onClick={() => handleDeleteClick(u)} className="p-2 rounded-lg hover:bg-red-900/20 text-gray-400 hover:text-red-400 transition-colors hover:cursor-pointer" title="Eliminar"><Trash2 size={16} /></button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- BARRA DE PAGINACIÓN (CLIENTE) --- */}
                    <div className="border-t border-gray-800 p-4 bg-gray-900/20 flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                            Página <span className="font-medium text-white">{currentPage}</span> de <span className="font-medium text-white">{totalPages}</span> ({filteredUsers.length} coincidencias)
                        </div>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={handlePrevPage}
                                disabled={currentPage === 1 || isLoading}
                                className="px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                            >
                                <ChevronLeft size={16} /> Anterior
                            </button>
                            <button 
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages || isLoading}
                                className="px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                            >
                                Siguiente <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={executeDelete}
                    title="Eliminar Usuario"
                    message={`¿Estás seguro de que deseas eliminar a ${selectedUser?.first_name} ${selectedUser?.last_name}? Esta acción no se puede deshacer.`}
                    confirmText="Sí, eliminar"
                    cancelText="Cancelar"
                    variant="danger"
                    isLoading={isSubmitting}
                />

                {/* MODALES CREAR/EDITAR (IGUAL QUE ANTES) */}
                {(isCreateModalOpen || isEditModalOpen) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-[#0B1121] border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">
                                    {isEditModalOpen ? "Editar Usuario" : "Nuevo Ponente"}
                                </h3>
                                <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false) }} className="text-gray-400 hover:cursor-pointer hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Nombre</label>
                                            <input required type="text" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Apellido</label>
                                            <input required type="text" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="relative z-20">
                                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Rol</label>
                                            {isEditModalOpen ? (
                                                <CustomSelect
                                                    value={formData.role}
                                                    onChange={(val) => setFormData({ ...formData, role: val as any })}
                                                    options={[
                                                        { value: "attendee", label: "Asistente" },
                                                        { value: "presenter", label: "Ponente" },
                                                    ]}
                                                    placeholder="Seleccionar rol"
                                                />
                                            ) : (
                                                <div className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-3 py-2.5 text-gray-400 font-medium cursor-not-allowed">Ponente</div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Especialidad</label>
                                            <input type="text" value={formData.speciality} onChange={e => setFormData({ ...formData, speciality: e.target.value })} placeholder="Opcional" className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 border-t border-gray-800 pt-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Correo Electrónico</label>
                                        <input required disabled={isEditModalOpen} type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-gray-800/50 border border-gray-800 rounded-xl px-3 py-2.5 text-gray-400" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase font-bold mb-1">{isEditModalOpen ? "" : "Contraseña"}</label>
                                        {!isEditModalOpen && (
                                            <input type="password" required={!isEditModalOpen} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} minLength={6} placeholder={isEditModalOpen ? "Dejar vacío para mantener actual" : "Mínimo 6 caracteres"} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none" />
                                        )}
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button type="submit" disabled={isSubmitting} className="w-full bg-white hover:rounded-3xl duration-300 text-black hover:cursor-pointer hover:bg-white/90 py-3 rounded-xl font-base transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                                        {isEditModalOpen ? "Guardar Cambios" : "Crear Ponente"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}