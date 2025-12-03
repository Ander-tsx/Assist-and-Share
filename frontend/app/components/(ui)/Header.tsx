'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
    Menu, X, ChevronRight, Edit2, XCircle, CheckCircle,
    LogOut
} from 'lucide-react'
import api from '@/lib/api'
import LogoutButton from '../LogoutButton'

// --- Tipos ---
type NavLink = { href: string; label: string }

interface UserData {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    speciality?: string;
}

const navLinksByRole: { [key: string]: NavLink[] } = {
    attendee: [
        { href: '/events', label: 'Eventos' },
        { href: '/my-inscriptions', label: 'Inscripciones' },
    ],
    presenter: [
        { href: '/events', label: 'Ponencias' },
        { href: '/feedback', label: 'Retroalimentación' },
    ],
    admin: [
        { href: '/events', label: 'Eventos' },
        { href: '/users', label: 'Usuarios' },
    ],
}

const roleDisplayNames: { [key: string]: string } = {
    attendee: 'Asistente',
    presenter: 'Ponente',
    admin: 'Administrador',
}

export default function Header() {
    const { user } = useAuth()
    const pathname = usePathname()

    // Estados
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [userData, setUserData] = useState<UserData | null>(null)

    // Estados para edición de usuario
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [formData, setFormData] = useState({ first_name: '', last_name: '', speciality: '' })

    // Referencias
    const dropdownRef = useRef<HTMLDivElement>(null)
    const mobileMenuRef = useRef<HTMLDivElement>(null)

    // --- DETECCIÓN DE RUTAS ---
    const isEventDetails = pathname.startsWith('/event-details')
    const isAttendees = pathname.startsWith('/attendees')
    const isEventEdit = pathname.startsWith('/events/edit') || pathname.startsWith('/event-edit')
    const isCreateEvent = pathname.startsWith('/create-event')

    // --- Carga de Usuario ---
    const fetchUser = async () => {
        if (!user?.id) return
        try {
            const res = await api.get(`/users/${user.id}`)
            setUserData(res.data.value)
            setFormData({
                first_name: res.data.value.first_name || '',
                last_name: res.data.value.last_name || '',
                speciality: res.data.value.speciality || ''
            })
        } catch (error) {
            console.error('Error obteniendo usuario', error)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [user])

    // --- Lógica Click Outside ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // --- Manejador Guardar Usuario ---
    const handleSave = async () => {
        setIsLoading(true)
        setMsg(null)
        try {
            await api.put('/users/me', formData)
            setMsg({ type: 'success', text: 'Guardado' })
            setIsEditing(false)
            fetchUser()
            setTimeout(() => setMsg(null), 2000)
        } catch (error: any) {
            setMsg({ type: 'error', text: 'Error' })
        } finally {
            setIsLoading(false)
        }
    }

    // --- Variables de Renderizado ---
    const currentLinks = user ? navLinksByRole[user.role] : []
    const userRoleDisplay = user ? roleDisplayNames[user.role] : ''
    const fullName = userData ? `${userData.first_name} ${userData.last_name}` : ''
    const initials = userData ? `${userData.first_name?.[0] || ''}${userData.last_name?.[0] || ''}` : 'U'

    return (
        // Header principal con fondo transparente/blur
        <header className="sticky top-0 z-20 w-full bg-gray-950/2 border-b border-gray-800/50 backdrop-blur-md transition-all">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 relative">

                    {/* LOGO */}
                    <Link
                        href="/events"
                        className="flex items-center gap-2 group z-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <span className="text-xl font-bold tracking-tight text-white">
                            Assist & Share
                        </span>
                    </Link>

                    {/* LINKS DESKTOP (Estilo Píldora Reactivado) */}
                    <div className="hidden md:flex md:items-center md:gap-4">
                        {currentLinks.map((link) => {
                            const isActive = pathname === link.href ||
                                (link.href === '/events' && (isEventDetails || isAttendees || isEventEdit)) ||
                                (link.href === '/create-event' && isCreateEvent)

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-200 ${isActive
                                        ? 'text-blue-400 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.1)]' // Estilo Píldora Activa
                                        : 'text-gray-400 hover:text-white hover:bg-white/5' // Estilo Inactivo
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            )
                        })}
                    </div>

                    {/* USER SECTION (Desktop) */}
                    <div className="hidden md:flex items-center gap-4 relative" ref={dropdownRef}>
                        {user && userData ? (
                            <>
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className={`flex items-center gap-3 py-1 px-2 rounded-lg transition-all hover:cursor-pointer ${isUserMenuOpen ? 'bg-gray-800' : 'hover:bg-white/5'}`}
                                >
                                    <div className="text-right hidden lg:block">
                                        <div className="text-sm font-medium text-white">{userData.first_name}</div>
                                        <div className="text-xs text-gray-500 uppercase">{userRoleDisplay}</div>
                                    </div>
                                    <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-bold text-blue-400">
                                        {initials}
                                    </div>
                                </button>

                                {/* DROPDOWN DESKTOP */}
                                {isUserMenuOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-80 bg-[#111827] border border-gray-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-white/5 z-50">
                                        <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                                                {initials}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="text-sm font-semibold text-white truncate">{fullName}</h4>
                                                <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                                            </div>
                                            {!isEditing && (
                                                <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800">
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="p-4 space-y-3">
                                            {msg && (
                                                <div className={`text-xs p-2 rounded flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                                    {msg.type === 'success' ? <CheckCircle size={12} /> : <XCircle size={12} />} {msg.text}
                                                </div>
                                            )}

                                            {isEditing ? (
                                                <div className="space-y-3 animate-in fade-in">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            value={formData.first_name}
                                                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                                            placeholder="Nombre"
                                                            className="w-full bg-gray-950/50 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                                                        />
                                                        <input
                                                            value={formData.last_name}
                                                            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                                            placeholder="Apellido"
                                                            className="w-full bg-gray-950/50 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                                                        />
                                                    </div>
                                                    <input
                                                        value={formData.speciality}
                                                        onChange={e => setFormData({ ...formData, speciality: e.target.value })}
                                                        placeholder="Especialidad"
                                                        className="w-full bg-gray-950/50 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                                                    />
                                                    <div className="flex gap-2 pt-1">
                                                        <button onClick={handleSave} disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded-lg text-xs font-medium">
                                                            {isLoading ? '...' : 'Guardar'}
                                                        </button>
                                                        <button onClick={() => setIsEditing(false)} className="px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs">
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[10px] uppercase text-gray-500 font-bold">Especialidad</p>
                                                        <p className="text-sm text-gray-300">{userData.speciality || "No especificada"}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2 border-t border-gray-800 bg-gray-900/30 flex justify-center">
                                            <LogoutButton />
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-gray-200">
                                Iniciar Sesión
                            </Link>
                        )}
                    </div>

                    {/* BOTÓN MOBILE ANIMADO */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-gray-400 hover:text-white z-50 relative"
                    >
                        <div className="w-6 h-6 relative flex items-center justify-center">
                            <span className={`absolute transition-all duration-300 ease-in-out transform ${isMobileMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}>
                                <Menu size={24} />
                            </span>
                            <span className={`absolute transition-all duration-300 ease-in-out transform ${isMobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}>
                                <X size={24} />
                            </span>
                        </div>
                    </button>
                </div>

                {/* --- MENU MOBILE DESPLEGABLE --- */}
                {/* - absolute top-full: Cae justo debajo de la barra header.
                   - bg-[#050505]: Fondo oscuro sólido para evitar invisibilidad sobre contenido.
                   - animate-in slide-in-from-top-5: Animación de despliegue suave.
                */}
                {isMobileMenuOpen && (
                    <div
                        ref={mobileMenuRef} //REdondeado solo de los bordes inferiores
                        className="absolute top-full left-0 w-full bg-[#141E2B] border-b border-gray-800/50 backdrop-blur-md rounded-b-3xl border-b border-gray-800 shadow-2xl md:hidden animate-in slide-in-from-top-5 fade-in duration-300 ease-out origin-top z-55"
                    >
                        <div className="p-4 space-y-4">
                            {user && userData && (
                                <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-blue-400 border border-gray-700">
                                                {initials}
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="text-white font-medium text-sm truncate">{fullName}</div>
                                                <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                            </div>
                                        </div>
                                        {!isEditing && (
                                            <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-lg">
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="space-y-2 pt-2 animate-in fade-in">
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    value={formData.first_name}
                                                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                                    className="bg-gray-950 border border-gray-700 rounded px-2 py-1 text-xs text-white w-full focus:border-blue-500 outline-none"
                                                    placeholder="Nombre"
                                                />
                                                <input
                                                    value={formData.last_name}
                                                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                                    className="bg-gray-950 border border-gray-700 rounded px-2 py-1 text-xs text-white w-full focus:border-blue-500 outline-none"
                                                    placeholder="Apellido"
                                                />
                                            </div>
                                            <input
                                                value={formData.speciality}
                                                onChange={e => setFormData({ ...formData, speciality: e.target.value })}
                                                className="bg-gray-950 border border-gray-700 rounded px-2 py-1 text-xs text-white w-full focus:border-blue-500 outline-none"
                                                placeholder="Especialidad"
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-1 rounded text-xs">
                                                    {isLoading ? '...' : 'Guardar'}
                                                </button>
                                                <button onClick={() => setIsEditing(false)} className="px-3 bg-gray-800 text-gray-300 py-1 rounded text-xs">
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] uppercase font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                                                {userRoleDisplay}
                                            </span>
                                            {userData.speciality && (
                                                <span className="text-[10px] text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">
                                                    {userData.speciality}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid gap-1">
                                {currentLinks.map((link) => {
                                    const isActive = pathname === link.href ||
                                        (link.href === '/events' && (isEventDetails || isAttendees || isEventEdit)) ||
                                        (link.href === '/create-event' && isCreateEvent)
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                                                : 'text-gray-300 hover:bg-white/5'
                                                }`}
                                        >
                                            {link.label}
                                        </Link>
                                    )
                                })}
                            </div>

                            <div className="pt-2 border-t border-gray-800">
                                {user ? (
                                    <LogoutButton />
                                ) : (
                                    <a
                                        href="/login"
                                        className="py-1 px-5 underline text-gray-300 rounded-lg text-xs hover:cursor-pointer"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Iniciar Sesión
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* --- BREADCRUMB --- */}
            {(isEventDetails || isAttendees || isEventEdit || isCreateEvent) && (
                <div className="w-full border-b border-gray-800 bg-gray-900/2 backdrop-blur-sm relative z-20 animate-in fade-in slide-in-from-top-2">
                    <div className="max-w-7xl mx-auto px-4 py-2 text-xs font-medium flex items-center gap-2 text-gray-400">
                        <Link href="/events" className="hover:text-white transition">
                            {user?.role === 'presenter' ? 'Ponencias' : 'Eventos'}
                        </Link>
                        <ChevronRight size={14} className="text-gray-600" />
                        {isAttendees || isEventEdit ? (
                            <>
                                <Link href={`/event-details/${pathname.split('/').pop()}`} className="hover:text-white transition">
                                    Gestión
                                </Link>
                                <ChevronRight size={14} className="text-gray-600" />
                                <span className="text-gray-200">{isAttendees ? 'Asistentes' : 'Edición'}</span>
                            </>
                        ) : isCreateEvent ? (
                            <span className="text-gray-200">Creación</span>
                        ) : (
                            <span className="text-gray-200">{user?.role === 'presenter' || user?.role === 'admin' ? 'Gestión' : 'Detalles'}</span>
                        )}
                    </div>
                </div>
            )}
        </header >
    )
}