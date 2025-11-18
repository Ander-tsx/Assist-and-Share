"use client"

import { useMemo } from "react"
import CustomSelect from "../../(ui)/CustomSelect"

// --- Definición de Interfaces ---

interface Presenter {
  _id: string
  first_name: string
  last_name: string
  email: string
}

interface EventFilterBarProps {
  typeFilter: string
  onTypeChange: (value: string) => void
  presenterFilter: string
  onPresenterChange: (value: string) => void
  presenters: Presenter[]
}

// --- Componente Principal ---

export default function EventFilterBar({
  typeFilter,
  onTypeChange,
  presenterFilter,
  onPresenterChange,
  presenters,
}: EventFilterBarProps) {
  // --- Helpers y Optimizaciones (useMemo) ---

  // Optimización: Memoizar las opciones de los ponentes para evitar
  // recalcular el array en cada renderizado.
  const presenterOptions = useMemo(() => {
    return [
      { value: "all", label: "Todos los ponentes" },
      ...presenters.map((presenter) => ({
        value: presenter._id,
        label: `${presenter.first_name} ${presenter.last_name}`,
      })),
    ]
  }, [presenters])

  // --- Renderizado ---

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <CustomSelect
        value={typeFilter}
        onChange={onTypeChange}
        options={[
          { value: "all", label: "Todos los tipos" },
          { value: "workshop", label: "Taller" },
          { value: "conference", label: "Conferencia" },
          { value: "seminar", label: "Seminario" },
        ]}
        placeholder="Tipo de evento"
      />

      <CustomSelect
        value={presenterFilter}
        onChange={onPresenterChange}
        options={presenterOptions}
        placeholder="Ponente"
      />
    </div>
  )
}