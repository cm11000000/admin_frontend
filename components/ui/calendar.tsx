import * as React from "react"
import { cn } from "@/lib/utils"

interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
  disabled?: (date: Date) => boolean
  className?: string
  minDate?: Date
  maxDate?: Date
}

export function Calendar({
  selected,
  onSelect,
  disabled,
  className,
  minDate,
  maxDate
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    selected ? new Date(selected) : new Date()
  )

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    )
  }

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    )
  }

  const isDateDisabled = (date: Date) => {
    if (disabled && disabled(date)) return true
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const isDateSelected = (date: Date) => {
    if (!selected) return false
    return (
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    )
  }

  const handleDateClick = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    )
    if (!isDateDisabled(date) && onSelect) {
      onSelect(date)
    }
  }

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="p-2" />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    )
    const isDisabled = isDateDisabled(date)
    const isSelected = isDateSelected(date)

    days.push(
      <button
        key={day}
        type="button"
        onClick={() => handleDateClick(day)}
        disabled={isDisabled}
        className={cn(
          "p-1.5 sm:p-2.5 text-xs sm:text-sm rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 touch-manipulation font-medium",
          isSelected &&
            "bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold shadow-md hover:shadow-lg",
          !isSelected &&
            !isDisabled &&
            "hover:bg-orange-50 hover:text-orange-600",
          isDisabled &&
            "text-gray-300 cursor-not-allowed",
          !isDisabled && !isSelected && "text-gray-700"
        )}
      >
        {day}
      </button>
    )
  }

  return (
    <div className={cn("p-3 sm:p-5 bg-white rounded-xl border border-gray-200 shadow-2xl w-[280px] sm:w-80 max-w-[95vw]", className)}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <button
          type="button"
          onClick={previousMonth}
          className="p-1.5 sm:p-2.5 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 touch-manipulation"
          aria-label="Previous month"
        >
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h3 className="text-sm sm:text-base font-bold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 sm:p-2.5 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 touch-manipulation"
          aria-label="Next month"
        >
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3">
        {dayNames.map((day) => (
          <div
            key={day}
            className="p-1 sm:p-2 text-xs font-bold text-center text-gray-600"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">{days}</div>
    </div>
  )
}
