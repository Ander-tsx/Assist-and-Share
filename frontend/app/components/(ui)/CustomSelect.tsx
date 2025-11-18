"use client"

import { useState } from "react"

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Seleccionar",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl px-5 py-3 min-w-[180px] text-left hover:border-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-white">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-2 left-0 right-0 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden z-20 shadow-2xl shadow-blue-500/10 animate-in fade-in slide-in-from-top-2 duration-200">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full px-5 py-3 text-left text-sm transition-all duration-200 ${
                  value === option.value
                    ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-white font-medium"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}