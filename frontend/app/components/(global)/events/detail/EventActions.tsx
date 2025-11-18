"use client"

import { useRouter } from 'next/navigation'
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
}: EventActionsProps) {
  const router = useRouter()

  if (!user) return null

  return (
    <div className="mt-6">
      {isAdmin && (
        <div className="flex gap-4">
          <button
            onClick={() => router.push(`/events/edit/${eventId}`)}
            className="flex-1 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 hover:shadow-lg hover:shadow-white/20"
          >
            Editar
          </button>
          <button
            onClick={() => router.push(`/events/attendees/${eventId}`)}
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
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
            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
              changed
                ? "bg-white text-black hover:bg-gray-200 hover:shadow-lg hover:shadow-white/20 hover:rounded-3xl duration-300 cursor-pointer"
                : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
            }`}
          >
            Guardar cambios
          </button>

          <button
            onClick={() => router.push(`/events/attendees/${eventId}`)}
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:rounded-3xl duration-300 cursor-pointer"
          >
            Gestionar asistentes
          </button>
        </div>
      )}

      {isAttendee && (
        <button
          onClick={onEnroll}
          className="w-full py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 hover:shadow-lg hover:shadow-white/20 hover:rounded-3xl duration-300 cursor-pointer"
        >
          Inscribirse
        </button>
      )}
    </div>
  )
}