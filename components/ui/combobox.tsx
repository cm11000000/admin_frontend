"use client";

import * as React from "react"
import * as ReactDOM from "react-dom"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  className?: string
  disabled?: boolean
  maxHeight?: string
  emptyMessage?: string
  onOpenChange?: (open: boolean) => void
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  className,
  disabled,
  maxHeight = "300px",
  emptyMessage = "No results found.",
  onOpenChange
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({})
  const portalRoot = typeof document !== 'undefined' ? document.body : null
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  const filteredOptions = React.useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return options
    return options.filter(opt =>
      opt.label.toLowerCase().includes(query) ||
      opt.value.toLowerCase().includes(query)
    )
  }, [options, search])

  const computePosition = () => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const top = rect.bottom + (window.scrollY || window.pageYOffset)
    const left = rect.left + (window.scrollX || window.pageXOffset)
    setDropdownStyle({ position: 'fixed', top, left, width: rect.width, zIndex: 9999 })
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (onOpenChange) {
      onOpenChange(newOpen)
    }
    if (newOpen) {
      computePosition()
      // Focus search input when opening
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 0)
    } else {
      // Clear search when closing
      setSearch("")
    }
  }

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      onChange(optionValue)
    }
    handleOpenChange(false)
  }

  // Close when clicking outside (consider dropdown portal as inside)
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const insideTrigger = !!containerRef.current && containerRef.current.contains(target)
      const insideDropdown = !!dropdownRef.current && dropdownRef.current.contains(target)
      if (!insideTrigger && !insideDropdown) handleOpenChange(false)
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const onScroll = () => computePosition()
    const onResize = () => computePosition()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    computePosition()
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => !disabled && handleOpenChange(!open)}
        disabled={disabled}
        className={cn(
          "w-full h-10 flex items-center justify-between px-3 py-2 text-left text-sm rounded border transition-colors",
          "bg-white border-gray-300 text-gray-900",
          "hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        <span className={cn(!selectedOption && "text-gray-500")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 text-gray-600" />
      </button>

      {open && portalRoot && (
        ReactDOM.createPortal(
        <div ref={dropdownRef} className="mt-1 bg-white border border-gray-300 rounded-md shadow-lg animate-in fade-in-0 zoom-in-95" style={dropdownStyle}>
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9 bg-white border-gray-300 text-gray-900 h-9 text-sm placeholder-gray-500 focus:ring-orange-500/50 focus:border-orange-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options List */}
          <div
            className="overflow-auto p-1"
            style={{ maxHeight }}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  // Use onMouseDown to ensure selection fires before outside click closes dropdown
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleSelect(option.value) }}
                  onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); handleSelect(option.value) }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors text-left",
                    value === option.value && "bg-orange-50 text-orange-900"
                  )}
                >
                  <span className="flex-1">{option.label}</span>
                  {value === option.value && (
                    <Check className="h-4 w-4 text-orange-600" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Show count if filtered */}
          {search && filteredOptions.length > 0 && filteredOptions.length !== options.length && (
            <div className="px-3 py-2 text-xs text-gray-600 border-t border-gray-200 bg-gray-50">
              Showing {filteredOptions.length} of {options.length} results
            </div>
          )}
        </div>, portalRoot)
      )}
    </div>
  )
}
