"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/api"

import LoadingSpinner from "@/app/components/(ui)/LoadingSpinner"
import ErrorDisplay from "@/app/components/(ui)/ErrorDisplay"
import EventHeader from "@/app/components/(global)/events/detail/EventHeader"
import EventInfo from "@/app/components/(global)/events/detail/EventInfo"
import EventActions from "@/app/components/(global)/events/detail/EventActions"
import EventDescription from "@/app/components/(global)/events/detail/EventDescription"
import EventRequirements from "@/app/components/(global)/events/detail/EventRequirements"
import EventMaterials from "@/app/components/(global)/events/detail/EventMaterials"

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
  attendees?: string[]
  createdAt: string
  updatedAt: string
}

interface Presenter {
  _id: string
  first_name: string
  last_name: string
  email: string
}

interface Material {
  id: string
  name: string
  type: "pptx" | "xlsx" | "pdf" | "docx"
  uploadDate: string
  url: string
}

// --- Componente Principal ---

export default function EventDetail() {
  const params = useParams()
  const id = params.id as string
  const { user, loading: loadingAuth } = useAuth()

  // Estado de los datos
  const [event, setEvent] = useState<Event | null>(null)
  const [presenter, setPresenter] = useState<Presenter | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])

  // Estado de la UI (carga y errores)
  const [isLoadingEvent, setIsLoadingEvent] = useState(true) // Corregido de loadingEvent a isLoadingEvent
  const [error, setError] = useState("")

  // Estado de Edición (Formulario)
  const [description, setDescription] = useState("")
  const [requirements, setRequirements] = useState("")
  const [hasChanges, setHasChanges] = useState(false) // Corregido de changed a hasChanges

  // --- Carga de Datos ---

  const fetchEvent = async () => {
    setIsLoadingEvent(true)
    setError("")
    try {
      const { data: eventData } = await api.get(`/events/${id}`)
      const currentEvent = eventData.value

      setEvent(currentEvent)
      setDescription(currentEvent.description || "")
      setRequirements(currentEvent.requirements?.join("\n") || "")

      if (currentEvent.presenter) {
        // ESTÁNDAR APLICADO: Desestructuración descriptiva
        const { data: presenterData } = await api.get(
          `/users/${currentEvent.presenter}`
        )
        setPresenter(presenterData.value)
      }

      // TODO: Esto debería venir de la API a futuro cracks
      setMaterials([
        {
          id: "1",
          name: "Presentación NodeJS.pptx",
          type: "pptx",
          uploadDate: "15 de Octubre de 2025",
          url: "#",
        },
        {
          id: "2",
          name: "Datos NodeJS.xlsx",
          type: "xlsx",
          uploadDate: "15 de Octubre de 2025",
          url: "#",
        },
      ])
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Error al cargar el evento"
      setError(errMsg)
    } finally {
      setIsLoadingEvent(false)
    }
  }

  useEffect(() => {
    if (!id) return
    fetchEvent()
  }, [id])

  // --- Manejadores de Eventos (Handlers) ---

  const handleSaveChanges = async () => {
    try {
      await api.put(`/events/${id}`, {
        description,
        requirements: requirements
          .split("\n")
          .map((r) => r.trim())
          .filter((r) => r !== ""),
      })
      setHasChanges(false)
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Error al guardar cambios"
      setError(errMsg)
    }
  }

  const handleEnroll = async () => {
    try {
      await api.post(`/events/${id}/enroll`)
      await fetchEvent() // Re-fetch para actualizar estado de asistentes
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Error al inscribirse"
      setError(errMsg)
    }
  }

  const handleRemoveMaterial = (materialId: string) => {
    setMaterials(materials.filter((m) => m.id !== materialId))
    setHasChanges(true)
  }

  const handleDescriptionChange = (value: string) => {
    setDescription(value)
    setHasChanges(true)
  }

  const handleRequirementsChange = (value: string) => {
    setRequirements(value)
    setHasChanges(true)
  }

  // --- Lógica de Renderizado ---

  const isAdmin = user?.role === "admin"
  const isPresenter = user?.role === "presenter" && user?.id === event?.presenter
  const isAttendee = user?.role === "attendee"
  const canEdit = isPresenter

  const isLoading = loadingAuth || isLoadingEvent // Corregido

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <ErrorDisplay message={error} />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-white text-xl">Evento no encontrado</p>
      </div>
    )
  }

  // --- JSX Principal ---

  return (
    <div className="min-h-screen text-white px-8 py-10" style={{ background: "linear-gradient(180deg, #1B293A 0%, #040711 10%)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <EventHeader imageUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:AN-d9GcS9VzbIhiRMB3MDNu1_rl05tug8QtXXRpKuUA&s" />

          <div className="flex flex-col justify-between">
            <EventInfo
              event={event}
              presenterName={
                presenter
                  ? `${presenter.first_name} ${presenter.last_name}`
                  : "No disponible"
              }
            />

            <EventActions
              user={user}
              isAdmin={isAdmin}
              isPresenter={isPresenter}
              isAttendee={isAttendee}
              changed={hasChanges} // Corregido
              eventId={event._id}
              onSaveChanges={handleSaveChanges}
              onEnroll={handleEnroll}
            />
          </div>
        </div>

        <EventDescription
          description={description}
          canEdit={canEdit}
          onChange={handleDescriptionChange}
        />

        <EventRequirements
          requirements={requirements}
          canEdit={canEdit}
          onChange={handleRequirementsChange}
        />

        <EventMaterials
          materials={materials}
          canEdit={canEdit}
          onRemove={handleRemoveMaterial}
        />
      </div>
    </div>
  )
}