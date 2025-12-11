// "use client"

// import { Calendar } from "lucide-react"

// interface DateRangePickerProps {
//   startDate: string
//   endDate: string
//   onStartDateChange: (date: string) => void
//   onEndDateChange: (date: string) => void
// }

// export default function DateRangePicker({
//   startDate,
//   endDate,
//   onStartDateChange,
//   onEndDateChange,
// }: DateRangePickerProps) {
  
//   // Estilos base para los inputs
//   const inputBaseClass = 
//     "w-full bg-[#111827] text-white text-sm border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 placeholder-gray-400"

//   return (
//     <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
//       <div className="relative w-full sm:w-auto">
//         <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//           <Calendar className="w-4 h-4 text-gray-400" />
//         </div>
//         <input
//           type="date"
//           value={startDate}
//           max={endDate} // La fecha inicial no puede ser mayor que la final seleccionada
//           onChange={(e) => onStartDateChange(e.target.value)}
//           className={`${inputBaseClass} pl-10`}
//           placeholder="Desde"
//         />
//       </div>

//       <span className="text-gray-400 hidden sm:block">-</span>

//       <div className="relative w-full sm:w-auto">
//         <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//           <Calendar className="w-4 h-4 text-gray-400" />
//         </div>
//         <input
//           type="date"
//           value={endDate}
//           min={startDate} // La fecha final no puede ser menor que la inicial seleccionada
//           onChange={(e) => onEndDateChange(e.target.value)}
//           className={`${inputBaseClass} pl-10`}
//           placeholder="Hasta"
//         />
//       </div>
//     </div>
//   )
// }