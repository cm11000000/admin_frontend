import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full border-2 text-gray-900 dark:text-white transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation",
  {
    variants: {
      variant: {
        default:
          "bg-gray-50/50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 focus-visible:bg-white dark:focus-visible:bg-slate-900 focus-visible:border-[#5CBBF6] focus-visible:ring-4 focus-visible:ring-[#5CBBF6]/10",
        filled:
          "bg-gray-100 dark:bg-slate-800 border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 focus-visible:bg-white dark:focus-visible:bg-slate-900 focus-visible:border-[#5CBBF6] focus-visible:ring-4 focus-visible:ring-[#5CBBF6]/10",
        glass:
          "bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-white/20 dark:border-slate-700/30 hover:border-white/30 dark:hover:border-slate-600/40 focus-visible:bg-white/80 dark:focus-visible:bg-slate-900/80 focus-visible:border-[#5CBBF6]/50 focus-visible:ring-4 focus-visible:ring-[#5CBBF6]/10",
      },
      inputSize: {
        sm: "min-h-[40px] h-10 px-3 py-2 text-sm rounded-lg sm:min-h-[44px]",
        md: "min-h-[44px] h-12 px-4 py-3.5 text-base rounded-xl sm:min-h-[48px]",
        lg: "min-h-[52px] h-14 px-6 py-4 text-lg rounded-2xl sm:min-h-[56px]",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  animate?: boolean
  onRightIconClick?: () => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant,
      inputSize,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      animate = true,
      onRightIconClick,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const generatedId = React.useId()
    const inputId = id || generatedId

    const inputElement = (
      <div className="relative w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium mb-2 transition-colors duration-200",
              error
                ? "text-red-600 dark:text-red-400"
                : isFocused
                ? "text-[#5CBBF6] dark:text-[#5CBBF6]"
                : "text-gray-700 dark:text-gray-300"
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none transition-colors duration-200",
                isFocused && "text-[#5CBBF6] dark:text-[#5CBBF6]"
              )}
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            type={type}
            id={inputId}
            className={cn(
              inputVariants({ variant, inputSize, className }),
              leftIcon && "pl-12",
              rightIcon && "pr-12",
              error && "border-red-400 dark:border-red-400 focus-visible:border-red-400 focus-visible:ring-4 focus-visible:ring-red-400/10"
            )}
            ref={ref}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors duration-200",
                onRightIconClick && "cursor-pointer hover:text-gray-700 dark:hover:text-gray-300",
                isFocused && !onRightIconClick && "text-[#5CBBF6] dark:text-[#5CBBF6]"
              )}
              onClick={onRightIconClick}
              role={onRightIconClick ? "button" : undefined}
              tabIndex={onRightIconClick ? 0 : undefined}
              aria-hidden={!onRightIconClick}
            >
              {rightIcon}
            </div>
          )}

          {/* Focus Ring Animation */}
          {animate && (
            <motion.div
              className={cn(
                "absolute inset-0 border-2 border-[#5CBBF6] pointer-events-none",
                inputSize === "sm" && "rounded-lg",
                inputSize === "md" && "rounded-xl",
                inputSize === "lg" && "rounded-2xl"
              )}
              initial={{ opacity: 0, scale: 1 }}
              animate={{
                opacity: isFocused ? 0.15 : 0,
                scale: isFocused ? 1.01 : 1,
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
          )}
        </div>
      </div>
    )

    return (
      <div className="space-y-2 w-full">
        {animate ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {inputElement}
          </motion.div>
        ) : (
          inputElement
        )}

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, x: -10, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              id={`${inputId}-error`}
              role="alert"
              aria-live="polite"
            >
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
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
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint Text */}
        {hint && !error && (
          <motion.p
            id={`${inputId}-hint`}
            className="text-sm text-gray-500 dark:text-gray-400"
            initial={animate ? { opacity: 0 } : undefined}
            animate={animate ? { opacity: 1 } : undefined}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {hint}
          </motion.p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

// Search Input Component
const SearchInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      type="search"
      variant="filled"
      leftIcon={
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      placeholder="Search..."
      className={className}
      {...props}
    />
  )
)
SearchInput.displayName = "SearchInput"

// Password Input Component
const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "rightIcon">>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        rightIcon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {showPassword ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m-3.172 3.172l6.364 6.364"
              />
            )}
          </svg>
        }
        onRightIconClick={() => setShowPassword(!showPassword)}
        className={className}
        {...props}
      />
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { Input, SearchInput, PasswordInput, inputVariants }
