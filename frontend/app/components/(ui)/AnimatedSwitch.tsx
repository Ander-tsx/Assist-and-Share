"use client"

interface AnimatedSwitchProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

export default function AnimatedSwitch({ value, onChange, options }: AnimatedSwitchProps) {
  const activeIndex = options.findIndex((opt) => opt.value === value)

  // Calcula el 'left' y 'width'
  // 2 opciones (50% cada una)
  const buttonWidthPercent = 100 / options.length
  const paddingPx = 4 // Corresponde a p-1 (0.25rem)
  const leftPosition = `calc(${activeIndex * buttonWidthPercent}% + ${paddingPx}px)`
  const width = `calc(${buttonWidthPercent}% - ${paddingPx * 2}px)`

  return (
    <div className="relative inline-flex bg-gray-900 border border-gray-800 rounded-full p-1">
      {/* Indicador animado */}
      <div
        className="absolute top-1 bottom-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out shadow-lg shadow-blue-500/30"
        style={{
          left: leftPosition,
          width: width,
        }}
      />

      {/* Botones */}
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`relative z-10 px-8 py-2.5 rounded-full font-medium transition-colors duration-300 ${
            value === option.value ? "text-white" : "text-gray-400 hover:text-gray-300"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}