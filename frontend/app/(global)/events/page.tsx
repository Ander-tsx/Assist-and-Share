"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/api"

import AnimatedSwitch from "@/app/components/(ui)/AnimatedSwitch"
import EventFilterBar from "@/app/components/(global)/events/EventFilterBar"
import EventCard from "@/app/components/(global)/events/EventCard"
import LoadingSpinner from "@/app/components/(ui)/LoadingSpinner"
import ErrorDisplay from "@/app/components/(ui)/ErrorDisplay"

// --- Definición de Interfaces ---

interface Event {
  _id: string
  title: string
  description: string
  capacity: number
  duration: number
  modality: "in-person" | "online" | "hybrid"
  date: string
  presenter: string
  location?: string
  link?: string
  requirements: string[]
  type: "workshop" | "conference" | "seminar"
  createdAt: string
  updatedAt: string
}

interface Presenter {
  _id: string
  first_name: string
  last_name: string
  email: string
}

// --- Componente Principal ---

export default function EventsPage() {
  const { user } = useAuth()
  
  // Estado de los datos
  const [events, setEvents] = useState<Event[]>([])
  const [presenters, setPresenters] = useState<Presenter[]>([])
  
  // Estado de la UI (carga y errores)
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [isLoadingPresenters, setIsLoadingPresenters] = useState(true)
  const [error, setError] = useState("")

  // Estado de los filtros
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("upcoming")
  const [presenterFilter, setPresenterFilter] = useState<string>("all")

  // --- Carga de Datos ---

  // 1. Cargar presentadores (para el filtro) solo una vez al montar
  const fetchPresenters = async () => {
    setIsLoadingPresenters(true)
    try {
      const { data: presentersData } = await api.get("/users", {
        params: { role: "presenter" },
      })
      setPresenters(presentersData.value.results)
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Error al cargar presentadores"
      setError(errMsg)
      console.error("Error fetching presenters:", err)
    } finally {
      setIsLoadingPresenters(false)
    }
  }

  useEffect(() => {
    fetchPresenters()
  }, []) // Dependencia vacía: se ejecuta solo una vez

  // 2. Cargar eventos cada vez que los filtros cambien
  const fetchEvents = async () => {
    setIsLoadingEvents(true)
    // No limpiar el error si fallaron los presentadores
    if (!isLoadingPresenters) {
      setError("")
    }

    try {
      // Construir query params
      const params: any = {}
      if (typeFilter !== "all") params.type = typeFilter
      if (presenterFilter !== "all") params.presenter = presenterFilter

      // Filtro de fecha
      const now = new Date()
      if (dateFilter === "upcoming") {
        params["date[gte]"] = now.toISOString()
      } else if (dateFilter === "past") {
        params["date[lt]"] = now.toISOString()
      }
      params.sort = "date"

      // Cargar eventos
      const { data: eventsData } = await api.get("/events", { params })
      setEvents(eventsData.value.results)
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Error al cargar eventos"
      setError(errMsg)
      console.error("Error fetching events:", err)
    } finally {
      setIsLoadingEvents(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [typeFilter, dateFilter, presenterFilter])

  // --- Helpers Optimizados ---

  // Optimización: Crear un mapa para búsqueda rápida de presentadores (O(1))
  // Se recalcula solo si el array de presentadores cambia.
  const presenterMap = useMemo(() => {
    const map = new Map<string, string>()
    presenters.forEach((p) => {
      map.set(p._id, `${p.first_name} ${p.last_name}`)
    })
    return map
  }, [presenters])

  // Función de búsqueda
  const getPresenterName = (presenterId: string) => {
    return presenterMap.get(presenterId) || "Presentador desconocido"
  }

  // Agrupar eventos solo cuando el array de eventos cambie.
  const groupedEvents = useMemo(() => {
    const grouped: Record<string, Event[]> = {}
    events.forEach((event) => {
      const date = new Date(event.date)
      const dateKey = date.toISOString().split("T")[0] // 'YYYY-MM-DD'
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })
    return grouped
  }, [events])

  // --- Renderizado ---

  const isLoading = isLoadingEvents || isLoadingPresenters
  const pageTitle = user?.role === "presenter" ? "Ponencias" : "Eventos"

  return (
    <div className="min-h-screen text-white p-8" style={{ background: "linear-gradient(180deg, #1B293A 0%, #040711 10%)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          {/* Título condicionado por el rol */}
          <h1 className="text-5xl font-bold">{pageTitle}</h1>
          <AnimatedSwitch
            value={dateFilter}
            onChange={setDateFilter}
            options={[
              { value: "upcoming", label: "Próximos" },
              { value: "past", label: "Finalizados" },
            ]}
          />
        </div>

        <EventFilterBar
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          presenterFilter={presenterFilter}
          onPresenterChange={setPresenterFilter}
          presenters={presenters}
        />

        {/* Error */}
        {error && <ErrorDisplay message={error} />}

        {/* Loading */}
        {isLoading && <LoadingSpinner />}

        {/* Eventos agrupados por fecha */}
        {!isLoading && Object.keys(groupedEvents).length === 0 && (
          <div className="text-center py-12 text-gray-400">No se encontraron eventos</div>
        )}

        {!isLoading && !error && (
          <div className="space-y-0">
            {Object.entries(groupedEvents).map(([dateKey, dateEvents], groupIndex) => {
              // Parseamos la clave 'YYYY-MM-DD'
              // Añadimos 'T00:00:00' para asegurar que se parsee en la zona horaria local
              const groupDate = new Date(dateKey + 'T00:00:00');

              return (
                <div key={dateKey} className="relative flex">
                  {/* Columna Izquierda - Fecha */}
                  <div className="flex-shrink-0 w-48 pr-8 pt-2">
                    <div className="text-left">
                      <p className="text-xl font-semibold">
                        {groupDate
                          .toLocaleDateString("es-MX", {
                            month: "long",
                            day: "numeric",
                          })
                          .replace(/^\w/, (c) => c.toUpperCase())}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {groupDate.toLocaleDateString("es-MX", {
                          weekday: "long",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Línea vertical con punto */}
                  <div className="relative flex-shrink-0 w-8 flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-600 mt-3 z-10"></div>
                    {groupIndex < Object.keys(groupedEvents).length - 1 && (
                      <div className="absolute top-3 bottom-0 left-1/2 -translate-x-1/2 w-px border-l-2 border-dashed border-gray-800"></div>
                    )}
                  </div>

                  {/* Columna Derecha - Eventos */}
                  <div className="flex-grow pl-8 pb-8 space-y-6">
                    {dateEvents.map((event) => (
                      <EventCard
                        key={event._id}
                        event={event}
                        presenterName={getPresenterName(event.presenter)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}