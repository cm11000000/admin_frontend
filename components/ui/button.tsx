import * as React from "react"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] touch-manipulation select-none relative overflow-hidden",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-[#FF9933] to-[#FF7A00] text-white shadow-[0_4px_14px_rgba(255,153,51,0.25)] hover:shadow-[0_6px_20px_rgba(255,153,51,0.35)] hover:from-[#FF7A00] hover:to-[#FF6B00] focus-visible:ring-[#FF9933] focus-visible:ring-offset-2 backdrop-blur-sm",
        secondary:
          "bg-gradient-to-r from-[#5CBBF6] to-[#4BA0D8] text-white shadow-[0_4px_14px_rgba(92,187,246,0.25)] hover:shadow-[0_6px_20px_rgba(92,187,246,0.35)] hover:from-[#4BA0D8] hover:to-[#3A8FC7] focus-visible:ring-[#5CBBF6] focus-visible:ring-offset-2 backdrop-blur-sm",
        success:
          "bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.35)] hover:from-[#059669] hover:to-[#047857] focus-visible:ring-[#10B981] focus-visible:ring-offset-2 backdrop-blur-sm",
        danger:
          "bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white shadow-[0_4px_14px_rgba(239,68,68,0.25)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.35)] hover:from-[#DC2626] hover:to-[#B91C1C] focus-visible:ring-[#EF4444] focus-visible:ring-offset-2 backdrop-blur-sm",
        ghost:
          "bg-slate-50/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 focus-visible:ring-slate-400 backdrop-blur-md",
        outline:
          "border-2 border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 shadow-sm hover:shadow-md focus-visible:ring-slate-400 backdrop-blur-md",
        link:
          "text-[#FF9933] dark:text-[#FFB366] underline-offset-4 hover:underline hover:text-[#FF7A00] dark:hover:text-[#FF9933] focus-visible:ring-[#FF9933] font-medium",
      },
      size: {
        sm: "h-10 min-h-[40px] px-4 text-sm min-w-[80px] md:min-h-[44px]",
        md: "h-11 min-h-[44px] px-6 text-base min-w-[100px] md:min-h-[48px]",
        lg: "h-12 min-h-[48px] px-8 text-lg min-w-[120px] md:min-h-[52px]",
        xl: "h-14 min-h-[52px] px-10 text-xl min-w-[140px] md:min-h-[56px]",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px]",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  animate?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      leftIcon,
      rightIcon,
      animate = true,
      loadingText = "Loading...",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const buttonContent = (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <motion.svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </motion.svg>
            {loadingText}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            <span className="truncate">{children}</span>
            {rightIcon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    )

    if (animate && !disabled && !loading) {
      return (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={fullWidth ? "w-full" : "inline-block"}
        >
          {buttonContent}
        </motion.div>
      )
    }

    return buttonContent
  }
)
Button.displayName = "Button"

// Icon Button variant for mobile-friendly circular buttons
const IconButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "leftIcon" | "rightIcon" | "children"> & { icon: React.ReactNode; label: string }
>(({ icon, label, ...props }, ref) => (
  <Button ref={ref} size="icon" aria-label={label} {...props}>
    {icon}
  </Button>
))
IconButton.displayName = "IconButton"

export { Button, IconButton, buttonVariants }
