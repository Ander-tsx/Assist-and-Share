"use client"

import { useRouter } from "next/navigation"
import type { User } from "@/hooks/useAuth"

interface EventActionsProps {
  user: User | null
  isAdmin: boolean
  isPresenter: boolean
  isAttendee: boolean
  changed: boolean
  eventId: string
  onSaveChanges: () => void
  onEnroll: () => void
  isEnrolled: boolean
  onCancel: () => void
  isPending: boolean
  isApproved: boolean
  onViewQR: () => void
  isPastEvent: boolean
}

export default function EventActions({
  user,
  isAdmin,
  isPresenter,
  isAttendee,
  changed,
  eventId,
  onSaveChanges,
  onEnroll,
  isEnrolled,
  onCancel,
  isPending,
  isApproved,
  onViewQR,
  isPastEvent,
}: EventActionsProps) {
  const router = useRouter()

  if (!user) return null

  return (
    <div className="mt-6">
      {isAdmin && (
        <div className="flex gap-4">
          <button
            onClick={() => router.push(`/events/edit/${eventId}`)}
            className="flex-1 py-3 bg-white text-black rounded-xl font-semibold transition-all duration-300 cursor-pointer hover:rounded-3xl"
          >
            Editar
          </button>
          <button
            onClick={() => router.push(`/attendees/${eventId}`)}
            className="flex-1 py-3 bg-white text-black rounded-xl font-semibold transition-all duration-300 cursor-pointer hover:rounded-3xl"
          >
            Gestionar asistentes
          </button>
        </div>
      )}

      {isPresenter && (
        <div className="flex gap-4">
          <button
            disabled={!changed}
            onClick={onSaveChanges}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${changed
              ? "bg-white text-black hover:bg-gray-200 hover:shadow-lg hover:shadow-white/20 hover:rounded-3xl duration-300 cursor-pointer"
              : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
              }`}
          >
            Guardar cambios
          </button>

          <button
            onClick={() => router.push(`/attendees/${eventId}`)}
            className="flex-1 py-3 bg-white text-black rounded-xl font-semibold transition-all duration-300 cursor-pointer hover:rounded-3xl"
          >
            Gestionar asistentes
          </button>
        </div>
      )}

      {isAttendee && !isPastEvent && (
        <>
          {!isEnrolled && (
            <div className="flex gap-4">
              <button
                onClick={onEnroll}
                className="flex-1 py-3 bg-white text-black rounded-xl font-semibold transition-all duration-300 cursor-pointer hover:rounded-3xl"
              >
                Inscribirse
              </button>
            </div>
          )}

          {isPending && (
            <div className="flex flex-col">
              <p className="text-yellow-400 text-sm font-medium my-2">
                Tu solicitud está pendiente de aprobación.
              </p>
              <button
                onClick={onCancel}
                className="flex-1 py-3 bg-white text-black rounded-xl font-semibold transition-all duration-300 cursor-pointer hover:rounded-3xl"
              >
                Cancelar inscripción
              </button>
            </div>
          )}

          {isApproved && (
            <div className="flex gap-4">
              <button
                onClick={onCancel}
                className="flex-1 py-3 bg-white text-black rounded-xl font-semibold transition-all duration-300 cursor-pointer hover:rounded-3xl"
              >
                Cancelar inscripción
              </button>
              <button
                onClick={onViewQR}
                className="flex-1 py-3 bg-white text-black rounded-xl font-semibold transition-all duration-300 cursor-pointer hover:rounded-3xl"
              >
                Ver QR
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
