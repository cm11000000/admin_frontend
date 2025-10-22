import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Simple checkbox implementation without Radix UI
const CheckboxPrimitive = {
  Root: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Indicator: ({ children }: any) => <div>{children}</div>
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    label?: string
    description?: string
    error?: string
  }
>(({ className, label, description, error, ...props }, ref) => {
  const generatedId = React.useId()
  const checkboxId = props.id || generatedId

  const checkboxElement = (
    <CheckboxPrimitive.Root
      ref={ref}
      id={checkboxId}
      className={cn(
        "peer h-5 w-5 shrink-0 rounded-lg border-2 border-gray-200 bg-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5CBBF6] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-300 touch-manipulation",
        "data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-[#FF9933] data-[state=checked]:to-[#FF7A00] data-[state=checked]:border-[#FF7A00] data-[state=checked]:shadow-md",
        error && "border-red-500",
        className
      )}
      aria-invalid={!!error}
      aria-describedby={
        description
          ? `${checkboxId}-description`
          : error
          ? `${checkboxId}-error`
          : undefined
      }
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-white")}
      >
        <motion.svg
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )

  if (label || description) {
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          {checkboxElement}
          <div className="flex-1 min-w-0">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-base font-medium text-slate-900 cursor-pointer select-none leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {label}
              </label>
            )}
            {description && (
              <p
                id={`${checkboxId}-description`}
                className="text-sm text-slate-600 mt-1.5 leading-relaxed"
              >
                {description}
              </p>
            )}
          </div>
        </div>
        {error && (
          <motion.p
            id={`${checkboxId}-error`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-red-600 flex items-center gap-1.5 ml-9"
            role="alert"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </motion.p>
        )}
      </div>
    )
  }

  return checkboxElement
})
Checkbox.displayName = "Checkbox"

// Checkbox Group for multiple checkboxes
interface CheckboxGroupProps {
  label?: string
  description?: string
  error?: string
  children: React.ReactNode
  className?: string
}

const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  ({ label, description, error, children, className }, ref) => {
    const generatedId = React.useId()

    return (
      <div ref={ref} className={cn("space-y-3", className)} role="group">
        {(label || description) && (
          <div className="space-y-1.5 mb-4">
            {label && (
              <p
                id={`${generatedId}-label`}
                className="text-base font-semibold text-slate-900"
              >
                {label}
              </p>
            )}
            {description && (
              <p
                id={`${generatedId}-description`}
                className="text-sm text-slate-600 leading-relaxed"
              >
                {description}
              </p>
            )}
          </div>
        )}
        <div className="space-y-3">{children}</div>
        {error && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-red-600 flex items-center gap-1.5"
            role="alert"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </motion.p>
        )}
      </div>
    )
  }
)
CheckboxGroup.displayName = "CheckboxGroup"

export { Checkbox, CheckboxGroup }
