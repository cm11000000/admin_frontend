"use client"
import * as React from "react"
import ReactDOM from "react-dom"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"

interface DatePickerProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  className?: string
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  minDate,
  maxDate,
  disabled
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [alignRight, setAlignRight] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({})
  const portalRoot = typeof document !== 'undefined' ? document.body : null

  // Parse YYYY-MM-DD as a local date to avoid UTC shifting
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    const parts = value.split("-")
    if (parts.length !== 3) return undefined
    const [y, m, d] = parts.map(Number)
    if (!y || !m || !d) return undefined
    return new Date(y, m - 1, d)
  }, [value])

  const handleSelect = (date: Date) => {
    if (onChange) {
      // Format date as YYYY-MM-DD in LOCAL time to avoid off-by-one issues
      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      const formatted = `${yyyy}-${mm}-${dd}`
      onChange(formatted)
    }
    setOpen(false)
  }

  const formatDisplayDate = (dateString: string) => {
    // Parse as local date for stable display
    const [y, m, d] = dateString.split('-').map(Number)
    const date = new Date(y, (m || 1) - 1, d || 1)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Compute position for fixed dropdown
  const computePosition = React.useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const calendarWidth = 320 // approximate calendar width
    const spaceOnRight = window.innerWidth - rect.left
    const shouldAlignRight = spaceOnRight < calendarWidth

    // For fixed positioning, use getBoundingClientRect directly (no scroll offsets)
    const top = rect.bottom + 4 // 4px gap
    const left = shouldAlignRight
      ? rect.right - calendarWidth
      : rect.left

    setDropdownStyle({ position: 'fixed', top, left, width: calendarWidth, zIndex: 9999 })
    setAlignRight(shouldAlignRight)
  }, [])

  // Check if calendar should align to the right to avoid overflow
  React.useEffect(() => {
    if (open) {
      computePosition()
    }
  }, [open, computePosition])

  // Recompute position on scroll and resize
  React.useEffect(() => {
    if (!open) return
    const onScroll = () => computePosition()
    const onResize = () => computePosition()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open, computePosition])

  // Close when clicking outside (account for portal dropdown as "inside")
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const clickedInsideTrigger = !!containerRef.current && containerRef.current.contains(target)
      const clickedInsideDropdown = !!dropdownRef.current && dropdownRef.current.contains(target)
      if (!clickedInsideTrigger && !clickedInsideDropdown) setOpen(false)
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full h-10 flex items-center justify-between px-3 py-2 text-left text-sm rounded border transition-colors",
          "bg-white border-gray-300 text-gray-900",
          "hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          !value && "text-gray-500",
          className
        )}
      >
        <span className={cn(value ? "text-gray-900" : "text-gray-500")}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <CalendarIcon className="h-4 w-4 text-gray-600" />
      </button>

      {open && portalRoot && (
        ReactDOM.createPortal(
          <div ref={dropdownRef} className="mt-1" style={dropdownStyle}>
            <Calendar
              selected={selectedDate}
              onSelect={handleSelect}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>,
          portalRoot
        )
      )}
    </div>
  )
}
