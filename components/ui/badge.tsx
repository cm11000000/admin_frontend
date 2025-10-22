import * as React from "react"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-all duration-200 whitespace-nowrap select-none",
  {
    variants: {
      variant: {
        default:
          "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700",
        primary:
          "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800",
        secondary:
          "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
        success:
          "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
        warning:
          "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
        danger:
          "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
        info: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800",
        outline:
          "bg-transparent border-2 border-current text-slate-700 dark:text-slate-300",
        gradient:
          "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md",
      },
      size: {
        sm: "px-2 py-0.5 text-xs min-h-[20px]",
        md: "px-3 py-1 text-sm min-h-[24px]",
        lg: "px-4 py-1.5 text-base min-h-[28px]",
      },
      dot: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      dot: false,
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  animate?: boolean
  icon?: React.ReactNode
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      dot,
      animate = true,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const badgeContent = (
      <span
        className={cn(badgeVariants({ variant, size, dot, className }))}
        ref={ref}
        {...props}
      >
        {dot && (
          <span
            className="w-2 h-2 rounded-full bg-current animate-pulse"
            aria-hidden="true"
          />
        )}
        {icon && <span aria-hidden="true">{icon}</span>}
        {children}
      </span>
    )

    if (animate) {
      return (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="inline-block"
        >
          {badgeContent}
        </motion.span>
      )
    }

    return badgeContent
  }
)
Badge.displayName = "Badge"

// Status Badge with predefined states
interface StatusBadgeProps extends Omit<BadgeProps, "variant" | "children"> {
  status: "active" | "inactive" | "pending" | "completed" | "failed" | "warning"
}

const statusConfig = {
  active: { variant: "success" as const, label: "Active", dot: true },
  inactive: { variant: "default" as const, label: "Inactive", dot: false },
  pending: { variant: "warning" as const, label: "Pending", dot: true },
  completed: { variant: "success" as const, label: "Completed", dot: false },
  failed: { variant: "danger" as const, label: "Failed", dot: false },
  warning: { variant: "warning" as const, label: "Warning", dot: false },
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, ...props }, ref) => {
    const config = statusConfig[status]
    return (
      <Badge ref={ref} variant={config.variant} dot={config.dot} {...props}>
        {config.label}
      </Badge>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

// Count Badge for notifications
interface CountBadgeProps extends Omit<BadgeProps, "children"> {
  count: number
  max?: number
}

const CountBadge = React.forwardRef<HTMLSpanElement, CountBadgeProps>(
  ({ count, max = 99, variant = "gradient", size = "sm", ...props }, ref) => {
    const displayCount = count > max ? `${max}+` : count
    const shouldAnimate = count > 0

    return (
      <Badge ref={ref} variant={variant} size={size} animate={shouldAnimate} {...props}>
        {displayCount}
      </Badge>
    )
  }
)
CountBadge.displayName = "CountBadge"

// Interactive Badge with remove functionality
interface RemovableBadgeProps extends BadgeProps {
  onRemove?: () => void
}

const RemovableBadge = React.forwardRef<HTMLSpanElement, RemovableBadgeProps>(
  ({ onRemove, children, className, ...props }, ref) => (
    <Badge
      ref={ref}
      className={cn("pr-1.5 gap-2", className)}
      {...props}
    >
      <span className="truncate max-w-[200px]">{children}</span>
      {onRemove && (
        <motion.button
          type="button"
          onClick={onRemove}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex-shrink-0 ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-current transition-colors"
          aria-label="Remove"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </motion.button>
      )}
    </Badge>
  )
)
RemovableBadge.displayName = "RemovableBadge"

export { Badge, StatusBadge, CountBadge, RemovableBadge, badgeVariants }
