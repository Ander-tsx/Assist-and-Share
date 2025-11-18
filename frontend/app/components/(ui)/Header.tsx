'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { UserCircle, Menu, X, LogOut } from 'lucide-react'

// --- Tipos de Navegación ---
type NavLink = { href: string; label: string }

const navLinksByRole: { [key: string]: NavLink[] } = {
    attendee: [
        { href: '/events', label: 'Eventos' },
        { href: '/my-inscriptions', label: 'Inscripciones' },
    ],
    presenter: [
        { href: '/events', label: 'Ponencias' },
        { href: '/feedback', label: 'Retroalimentación' },
        { href: '/attendees', label: 'Asistentes' },
    ],
    admin: [
        { href: '/events', label: 'Eventos' },
        { href: '/users', label: 'Usuarios' },
        { href: '/attendees', label: 'Asistentes' },
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handler = () => {}
        window.addEventListener("storage", handler)
        return () => window.removeEventListener("storage", handler)
    }, [])

    const currentLinks = user ? navLinksByRole[user.role] : []
    const userRoleDisplay = user ? roleDisplayNames[user.role] : ''

    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-gray-950/2 border-b border-gray-800/50">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* LOGO con efecto de resplandor */}
                    <Link
                        href="/events"
                        className="relative flex items-center gap-2 text-2xl font-bold group"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <div className="relative">
                            <span className="relative z-10 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-extrabold tracking-tight">
                                APEX
                            </span>
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                    </Link>

                    {/* LINKS DESKTOP con indicador animado */}
                    <div className="hidden md:flex md:items-center md:gap-1">
                        {currentLinks.map((link) => {
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="relative px-4 py-2 text-sm font-medium transition-colors group"
                                >
                                    <span className={`relative z-10 ${
                                        isActive 
                                            ? 'text-white' 
                                            : 'text-gray-400 group-hover:text-white'
                                    } transition-colors duration-200`}>
                                        {link.label}
                                    </span>
                                    
                                    {/* Indicador de página activa */}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse" />
                                    )}
                                    
                                    {/* Efecto hover */}
                                    <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </Link>
                            )
                        })}
                    </div>

                    {/* PERFIL DESKTOP con hover mejorado */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="relative flex items-center gap-3 px-4 py-2 rounded-lg border border-gray-800/50 bg-gray-900/50 backdrop-blur-sm group hover:border-blue-500/30 transition-all duration-300">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <UserCircle className="relative z-10 w-8 h-8 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                                <div className="relative z-10 flex flex-col">
                                    <span className="text-xs text-gray-500">Rol</span>
                                    <span className="text-sm text-gray-200 font-medium">{userRoleDisplay}</span>
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="relative px-6 py-2.5 rounded-lg text-sm font-medium overflow-hidden group"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 transition-transform duration-300 group-hover:scale-105" />
                                <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="relative z-10 text-white">Iniciar Sesión</span>
                            </Link>
                        )}
                    </div>

                    {/* BOTÓN MOBILE mejorado */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden relative p-2 rounded-lg border border-gray-800/50 bg-gray-900/50 text-gray-400 hover:text-white hover:border-blue-500/30 transition-all duration-300"
                        aria-label="Toggle mobile menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* MENU MOBILE con animación mejorada */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 w-full backdrop-blur-xl bg-gray-950/95 border-b border-gray-800/50 shadow-2xl animate-in slide-in-from-top duration-300">
                    <div className="flex flex-col space-y-2 px-4 py-6 max-w-7xl mx-auto">

                        {user ? (
                            <div className="flex items-center gap-3 border border-gray-800/50 bg-gray-900/50 rounded-lg p-4 mb-4">
                                <UserCircle className="w-12 h-12 text-blue-400" />
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500">Rol</span>
                                    <span className="text-sm text-gray-200 font-medium">{userRoleDisplay}</span>
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="relative px-6 py-3 rounded-lg text-base font-medium text-center overflow-hidden mb-4"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600" />
                                <span className="relative z-10 text-white">Iniciar Sesión</span>
                            </Link>
                        )}

                        {currentLinks.map((link) => {
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative px-4 py-3 rounded-lg text-base transition-all duration-200 ${
                                        isActive 
                                            ? 'text-white bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30' 
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.label}
                                    {isActive && (
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </header>
    )
}
