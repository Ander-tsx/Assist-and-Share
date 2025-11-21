'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Menu, X } from 'lucide-react'
import api from '@/lib/api'

// --- Tipos ---
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
    const [userData, setUserData] = useState<any>(null)

    // Detectar si estamos en los detalles de evento
    const isEventDetails = pathname.startsWith('/event-details')

    useEffect(() => {
        if (!user?.id) return

        const fetchUser = async () => {
            try {
                const res = await api.get(`/users/${user.id}`)
                setUserData(res.data.value)
            } catch (error) {
                console.error('Error obteniendo usuario', error)
            }
        }

        fetchUser()
    }, [user])

    const currentLinks = user ? navLinksByRole[user.role] : []
    const userRoleDisplay = user ? roleDisplayNames[user.role] : ''
    const fullName = userData ? `${userData.first_name} ${userData.last_name}` : ''

    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-gray-950/2">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* LOGO */}
                    <Link
                        href="/events"
                        className="relative flex items-center gap-2 text-2xl font-bold group"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <span className="relative z-10 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-extrabold tracking-tight">
                            APEX
                        </span>
                    </Link>

                    {/* LINKS DESKTOP */}
                    <div className="hidden md:flex md:items-center md:gap-1">
                        {currentLinks.map((link) => {
                            const isActive =
                                pathname === link.href ||
                                (link.href === '/events' && isEventDetails)

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="relative px-4 py-2 text-sm font-medium transition-colors group"
                                >
                                    <span
                                        className={`relative z-10 ${
                                            isActive
                                                ? 'text-white'
                                                : 'text-gray-400 group-hover:text-white'
                                        } transition-colors duration-200`}
                                    >
                                        {link.label}
                                    </span>

                                    {isActive && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse" />
                                    )}
                                </Link>
                            )
                        })}
                    </div>

                    {/* USER DATA */}
                    <div className="hidden md:flex items-center gap-4">
                        {user && userData ? (
                            <div className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-white/2 rounded-lg duration-300">
                                <div className="flex flex-col leading-tight">
                                    <span className="text-sm text-gray-200 font-medium">{fullName}</span>
                                    <span className="text-xs text-gray-500">{userRoleDisplay}</span>
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

                    {/* BOTÓN MOBILE */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg border border-gray-800/50 bg-gray-900/50 text-gray-400 hover:text-white hover:border-blue-500/30 transition-all duration-300"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* MENU MOBILE */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 w-full backdrop-blur-xl bg-gray-950/95 border-b border-gray-800/50 shadow-2xl animate-in slide-in-from-top duration-300">
                    <div className="flex flex-col space-y-2 px-4 py-6 max-w-7xl mx-auto">

                        {user && userData ? (
                            <div className="flex flex-col mb-4">
                                <span className="text-base text-gray-200 font-medium">{fullName}</span>
                                <span className="text-xs text-gray-500">{userRoleDisplay}</span>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="px-6 py-3 rounded-lg text-base font-medium text-center bg-gradient-to-r from-blue-600 to-cyan-600 text-white mb-4"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Iniciar Sesión
                            </Link>
                        )}

                        {currentLinks.map((link) => {
                            const isActive =
                                pathname === link.href ||
                                (link.href === '/events' && isEventDetails)

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
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* BREADCRUMB */}
            {isEventDetails && (
                <div className="w-full border-b border-gray-800/50">
                    <div className="max-w-7xl mx-auto px-4 py-3 text-sm flex items-center gap-2 text-gray-400">

                        {user?.role === 'presenter' ? (
                            <>
                                <Link href="/events" className="hover:text-white transition">Ponencias</Link>
                                <span className="text-gray-600">{'>'}</span>
                                <span className="text-gray-300">Gestión</span>
                            </>
                        ) : user?.role === 'admin' ? (
                            <>
                                <Link href="/events" className="hover:text-white transition">Eventos</Link>
                                <span className="text-gray-600">{'>'}</span>
                                <span className="text-gray-300">Gestión</span>
                            </>
                        ) : (
                            <>
                                <Link href="/events" className="hover:text-white transition">Eventos</Link>
                                <span className="text-gray-600">{'>'}</span>
                                <span className="text-gray-300">Detalles</span>
                            </>
                        )}

                    </div>
                </div>
            )}
        </header>
    )
}
