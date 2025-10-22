import * as React from "react"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Simple progress implementation without Radix UI
const ProgressPrimitive = {
  Root: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>),
  Indicator: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>)
}
ProgressPrimitive.Root.displayName = "ProgressRoot"
ProgressPrimitive.Indicator.displayName = "ProgressIndicator"

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-gray-200 shadow-inner",
  {
    variants: {
      size: {
        sm: "h-2",
        md: "h-2.5",
        lg: "h-4",
        xl: "h-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-500 ease-out rounded-full",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#FF9933] to-[#FF7A00] shadow-sm",
        primary: "bg-gradient-to-r from-[#FF9933] to-[#FF7A00] shadow-sm shadow-orange-300",
        success: "bg-gradient-to-r from-green-500 to-green-600 shadow-sm shadow-green-300",
        warning: "bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-sm shadow-yellow-300",
        danger: "bg-gradient-to-r from-red-500 to-red-600 shadow-sm shadow-red-300",
        info: "bg-gradient-to-r from-[#5CBBF6] to-[#4BA0D8] shadow-sm shadow-blue-300",
      },
      animated: {
        true: "relative overflow-hidden",
        false: "",
      },
      glowing: {
        true: "shadow-lg",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      animated: false,
      glowing: false,
    },
  }
)

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof progressIndicatorVariants> {
  value?: number
  max?: number
  showValue?: boolean
  label?: string
  animate?: boolean
  striped?: boolean
  glowing?: boolean
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value = 0,
      max = 100,
      size,
      variant,
      showValue = false,
      label,
      animate = true,
      striped = false,
      glowing = false,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
      <div className="w-full space-y-2">
        {(label || showValue) && (
          <div className="flex items-center justify-between text-sm">
            {label && (
              <span className="font-medium text-gray-700">
                {label}
              </span>
            )}
            {showValue && (
              <span className="font-semibold text-gray-900">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(progressVariants({ size }), className)}
          value={value}
          max={max}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              progressIndicatorVariants({
                variant,
                animated: striped,
                glowing: glowing && percentage > 0
              }),
              glowing && percentage > 0 && variant === "primary" && "shadow-[0_0_10px_rgba(255,153,51,0.5)]",
              glowing && percentage > 0 && variant === "info" && "shadow-[0_0_10px_rgba(92,187,246,0.5)]",
            )}
            style={{
              transform: `translateX(-${100 - percentage}%)`,
            }}
            asChild={animate}
          >
            {animate ? (
              <motion.div
                className={cn(
                  "h-full rounded-full relative",
                  striped && "bg-[length:20px_20px]",
                  striped && variant === "primary" && "bg-[linear-gradient(45deg,rgba(255,255,255,.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.2)_50%,rgba(255,255,255,.2)_75%,transparent_75%,transparent)]",
                  striped && "animate-[progress-stripes_1s_linear_infinite]"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                }}
              />
            ) : (
              <div
                className={cn(
                  "h-full rounded-full relative",
                  striped && "bg-[length:20px_20px]",
                  striped && variant === "primary" && "bg-[linear-gradient(45deg,rgba(255,255,255,.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.2)_50%,rgba(255,255,255,.2)_75%,transparent_75%,transparent)]",
                  striped && "animate-[progress-stripes_1s_linear_infinite]"
                )}
              />
            )}
          </ProgressPrimitive.Indicator>
        </ProgressPrimitive.Root>
      </div>
    )
  }
)
Progress.displayName = ProgressPrimitive.Root.displayName

// Circular Progress Component
interface CircularProgressProps {
  value?: number
  max?: number
  size?: number
  strokeWidth?: number
  variant?: ProgressProps["variant"]
  showValue?: boolean
  label?: string
  className?: string
  animate?: boolean
  glowing?: boolean
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      value = 0,
      max = 100,
      size = 120,
      strokeWidth = 8,
      variant = "primary",
      showValue = true,
      label,
      className,
      animate = true,
      glowing = false,
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percentage / 100) * circumference

    const colorMap = {
      default: "stroke-[#FF9933]",
      primary: "stroke-[#FF9933]",
      success: "stroke-green-500",
      warning: "stroke-yellow-500",
      danger: "stroke-red-500",
      info: "stroke-[#5CBBF6]",
    }

    const glowMap = {
      default: "drop-shadow-[0_0_8px_rgba(255,153,51,0.5)]",
      primary: "drop-shadow-[0_0_8px_rgba(255,153,51,0.5)]",
      success: "drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]",
      warning: "drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]",
      danger: "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]",
      info: "drop-shadow-[0_0_8px_rgba(92,187,246,0.5)]",
    }

    return (
      <div ref={ref} className={cn("inline-flex flex-col items-center gap-2", className)}>
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            className={cn(
              "transform -rotate-90 transition-all duration-300",
              glowing && percentage > 0 && glowMap[variant || "primary"]
            )}
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-gray-200"
            />
            {/* Progress circle */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={animate ? circumference : offset}
              className={cn(colorMap[variant || "primary"], "transition-all duration-500")}
              initial={animate ? { strokeDashoffset: circumference } : undefined}
              animate={animate ? { strokeDashoffset: offset } : undefined}
              transition={animate ? { duration: 1, ease: "easeOut" } : undefined}
            />
          </svg>
          {showValue && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(percentage)}%
              </span>
            </div>
          )}
        </div>
        {label && (
          <span className="text-sm font-medium text-gray-700">
            {label}
          </span>
        )}
      </div>
    )
  }
)
CircularProgress.displayName = "CircularProgress"

// Stepped Progress Component
interface SteppedProgressProps {
  steps: string[]
  currentStep: number
  variant?: ProgressProps["variant"]
  className?: string
}

const SteppedProgress = React.forwardRef<HTMLDivElement, SteppedProgressProps>(
  ({ steps, currentStep, variant = "primary", className }, ref) => {
    const colorMap = {
      default: {
        complete: "bg-[#FF9933] border-[#FF9933]",
        current: "bg-[#FF9933] border-[#FF9933]",
        incomplete: "bg-gray-200 border-gray-300",
      },
      primary: {
        complete: "bg-gradient-to-r from-[#FF9933] to-[#FF7A00] border-[#FF9933]",
        current: "bg-gradient-to-r from-[#FF9933] to-[#FF7A00] border-[#FF9933]",
        incomplete: "bg-gray-200 border-gray-300",
      },
      success: {
        complete: "bg-green-500 border-green-500",
        current: "bg-green-500 border-green-500",
        incomplete: "bg-gray-200 border-gray-300",
      },
      warning: {
        complete: "bg-yellow-500 border-yellow-500",
        current: "bg-yellow-500 border-yellow-500",
        incomplete: "bg-gray-200 border-gray-300",
      },
      danger: {
        complete: "bg-red-500 border-red-500",
        current: "bg-red-500 border-red-500",
        incomplete: "bg-gray-200 border-gray-300",
      },
      info: {
        complete: "bg-gradient-to-r from-[#5CBBF6] to-[#4BA0D8] border-[#5CBBF6]",
        current: "bg-gradient-to-r from-[#5CBBF6] to-[#4BA0D8] border-[#5CBBF6]",
        incomplete: "bg-gray-200 border-gray-300",
      },
    }

    const colors = colorMap[variant || "primary"]

    return (
      <div ref={ref} className={cn("w-full", className)}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isComplete = index < currentStep
            const isCurrent = index === currentStep
            const isIncomplete = index > currentStep

            return (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center gap-2 flex-1">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold transition-all duration-300 shadow-sm",
                      isComplete && colors.complete + " text-white",
                      isCurrent && colors.current + " text-white ring-4 ring-[#FF9933]/20 shadow-lg shadow-orange-300",
                      isIncomplete && colors.incomplete + " text-gray-500"
                    )}
                  >
                    {isComplete ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </motion.div>
                  <span
                    className={cn(
                      "text-xs font-medium text-center max-w-[80px] leading-tight",
                      (isComplete || isCurrent)
                        ? "text-gray-900"
                        : "text-gray-500"
                    )}
                  >
                    {step}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 -mt-8 relative">
                    <div className="absolute inset-0 bg-gray-200" />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: index < currentStep ? "100%" : "0%" }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={cn(
                        "absolute inset-y-0 left-0",
                        isComplete ? colors.complete : ""
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    )
  }
)
SteppedProgress.displayName = "SteppedProgress"

export { Progress, CircularProgress, SteppedProgress, progressVariants }
