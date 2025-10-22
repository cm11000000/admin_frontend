import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SliderProps {
  min?: number
  max?: number
  step?: number
  value?: number[]
  onValueChange?: (value: number[]) => void
  className?: string
  disabled?: boolean
  variant?: 'default' | 'primary' | 'info'
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({
    min = 0,
    max = 100,
    step = 1,
    value = [0],
    onValueChange,
    className = '',
    disabled = false,
    variant = 'primary'
  }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false)
    const [currentValue, setCurrentValue] = React.useState(value[0] || 0)
    const sliderRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      setCurrentValue(value[0] || 0)
    }, [value])

    const percentage = ((currentValue - min) / (max - min)) * 100

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value)
      setCurrentValue(newValue)
      onValueChange?.([newValue])
    }

    const variantStyles = {
      default: {
        track: 'bg-gradient-to-r from-[#FF9933] to-[#FF7A00]',
        glow: 'shadow-[0_0_8px_rgba(255,153,51,0.4)]',
        focus: 'ring-[#5CBBF6]'
      },
      primary: {
        track: 'bg-gradient-to-r from-[#FF9933] to-[#FF7A00]',
        glow: 'shadow-[0_0_8px_rgba(255,153,51,0.4)]',
        focus: 'ring-[#5CBBF6]'
      },
      info: {
        track: 'bg-gradient-to-r from-[#5CBBF6] to-[#4BA0D8]',
        glow: 'shadow-[0_0_8px_rgba(92,187,246,0.4)]',
        focus: 'ring-[#5CBBF6]'
      }
    }

    const styles = variantStyles[variant]

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center py-4',
          className
        )}
      >
        {/* Custom slider track and thumb */}
        <div className="relative w-full h-2 rounded-full bg-gray-200 shadow-inner">
          {/* Active track (filled portion) */}
          <div
            className={cn(
              'absolute h-full rounded-full transition-all duration-300 ease-out shadow-sm',
              styles.track,
              isDragging && styles.glow
            )}
            style={{ width: `${percentage}%` }}
          />

          {/* Native input (invisible but functional) */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={currentValue}
            onChange={handleChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            disabled={disabled}
            className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            style={{ zIndex: 10 }}
          />

          {/* Custom thumb */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2',
              'shadow-lg transition-all duration-300 ease-out pointer-events-none',
              variant === 'primary' && 'border-[#FF9933]',
              variant === 'info' && 'border-[#5CBBF6]',
              variant === 'default' && 'border-[#FF9933]',
              !disabled && 'hover:scale-110 hover:shadow-xl',
              isDragging && 'scale-110 shadow-xl',
              isDragging && styles.glow,
              disabled && 'opacity-50'
            )}
            style={{
              left: `calc(${percentage}% - 10px)`,
            }}
          />
        </div>

        {/* Focus ring container */}
        <div
          className={cn(
            'absolute inset-0 rounded-full opacity-0 transition-opacity pointer-events-none',
            'focus-within:opacity-100 focus-within:ring-2 focus-within:ring-offset-2',
            `focus-within:${styles.focus}`
          )}
        />
      </div>
    )
  }
)
Slider.displayName = 'Slider'

// Range Slider Component (for selecting a range)
export interface RangeSliderProps {
  min?: number
  max?: number
  step?: number
  value?: [number, number]
  onValueChange?: (value: [number, number]) => void
  className?: string
  disabled?: boolean
  variant?: 'default' | 'primary' | 'info'
}

const RangeSlider = React.forwardRef<HTMLDivElement, RangeSliderProps>(
  ({
    min = 0,
    max = 100,
    step = 1,
    value = [0, 100],
    onValueChange,
    className = '',
    disabled = false,
    variant = 'primary'
  }, ref) => {
    const [isDragging, setIsDragging] = React.useState<'min' | 'max' | null>(null)
    const [minValue, setMinValue] = React.useState(value[0])
    const [maxValue, setMaxValue] = React.useState(value[1])

    React.useEffect(() => {
      setMinValue(value[0])
      setMaxValue(value[1])
    }, [value])

    const minPercentage = ((minValue - min) / (max - min)) * 100
    const maxPercentage = ((maxValue - min) / (max - min)) * 100

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value)
      if (newValue <= maxValue) {
        setMinValue(newValue)
        onValueChange?.([newValue, maxValue])
      }
    }

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value)
      if (newValue >= minValue) {
        setMaxValue(newValue)
        onValueChange?.([minValue, newValue])
      }
    }

    const variantStyles = {
      default: {
        track: 'bg-gradient-to-r from-[#FF9933] to-[#FF7A00]',
        glow: 'shadow-[0_0_8px_rgba(255,153,51,0.4)]',
        focus: 'ring-[#5CBBF6]'
      },
      primary: {
        track: 'bg-gradient-to-r from-[#FF9933] to-[#FF7A00]',
        glow: 'shadow-[0_0_8px_rgba(255,153,51,0.4)]',
        focus: 'ring-[#5CBBF6]'
      },
      info: {
        track: 'bg-gradient-to-r from-[#5CBBF6] to-[#4BA0D8]',
        glow: 'shadow-[0_0_8px_rgba(92,187,246,0.4)]',
        focus: 'ring-[#5CBBF6]'
      }
    }

    const styles = variantStyles[variant]

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center py-4',
          className
        )}
      >
        <div className="relative w-full h-2 rounded-full bg-gray-200 shadow-inner">
          {/* Active track (filled portion between min and max) */}
          <div
            className={cn(
              'absolute h-full rounded-full transition-all duration-300 ease-out shadow-sm',
              styles.track,
              isDragging && styles.glow
            )}
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`
            }}
          />

          {/* Min value input */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={minValue}
            onChange={handleMinChange}
            onMouseDown={() => setIsDragging('min')}
            onMouseUp={() => setIsDragging(null)}
            onTouchStart={() => setIsDragging('min')}
            onTouchEnd={() => setIsDragging(null)}
            disabled={disabled}
            className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed pointer-events-none"
            style={{ zIndex: minValue > (min + max) / 2 ? 11 : 10 }}
          />

          {/* Max value input */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={maxValue}
            onChange={handleMaxChange}
            onMouseDown={() => setIsDragging('max')}
            onMouseUp={() => setIsDragging(null)}
            onTouchStart={() => setIsDragging('max')}
            onTouchEnd={() => setIsDragging(null)}
            disabled={disabled}
            className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed pointer-events-none"
            style={{ zIndex: maxValue <= (min + max) / 2 ? 11 : 10 }}
          />

          {/* Min thumb */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2',
              'shadow-lg transition-all duration-300 ease-out pointer-events-none',
              variant === 'primary' && 'border-[#FF9933]',
              variant === 'info' && 'border-[#5CBBF6]',
              variant === 'default' && 'border-[#FF9933]',
              !disabled && 'hover:scale-110 hover:shadow-xl',
              isDragging === 'min' && 'scale-110 shadow-xl',
              isDragging === 'min' && styles.glow,
              disabled && 'opacity-50'
            )}
            style={{
              left: `calc(${minPercentage}% - 10px)`,
              zIndex: isDragging === 'min' ? 12 : 10
            }}
          />

          {/* Max thumb */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2',
              'shadow-lg transition-all duration-300 ease-out pointer-events-none',
              variant === 'primary' && 'border-[#FF9933]',
              variant === 'info' && 'border-[#5CBBF6]',
              variant === 'default' && 'border-[#FF9933]',
              !disabled && 'hover:scale-110 hover:shadow-xl',
              isDragging === 'max' && 'scale-110 shadow-xl',
              isDragging === 'max' && styles.glow,
              disabled && 'opacity-50'
            )}
            style={{
              left: `calc(${maxPercentage}% - 10px)`,
              zIndex: isDragging === 'max' ? 12 : 10
            }}
          />
        </div>
      </div>
    )
  }
)
RangeSlider.displayName = 'RangeSlider'

export { Slider, RangeSlider }
