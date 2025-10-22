import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean
  variant?: "default" | "circular" | "rectangular" | "text"
  shimmer?: boolean
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, animate = true, variant = "default", shimmer = false, ...props }, ref) => {
    const baseClasses = "bg-gray-200"
    const variantClasses = {
      default: "rounded-xl",
      circular: "rounded-full",
      rectangular: "rounded-none",
      text: "rounded-lg h-4",
    }

    const skeletonElement = (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          !shimmer && animate && "animate-pulse",
          "relative overflow-hidden",
          className
        )}
        {...props}
      >
        {shimmer && (
          <motion.div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
            animate={{
              translateX: ["0%", "200%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
      </div>
    )

    if (animate && !shimmer) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {skeletonElement}
        </motion.div>
      )
    }

    return skeletonElement
  }
)
Skeleton.displayName = "Skeleton"

// Shimmer Skeleton with gradient animation
const ShimmerSkeleton = React.forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, "animate" | "shimmer">
>(({ className, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default: "rounded-xl",
    circular: "rounded-full",
    rectangular: "rounded-none",
    text: "rounded-lg h-4",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent"
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  )
})
ShimmerSkeleton.displayName = "ShimmerSkeleton"

// Pulse Skeleton with smooth pulsing effect
const PulseSkeleton = React.forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, "animate" | "shimmer">
>(({ className, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default: "rounded-xl",
    circular: "rounded-full",
    rectangular: "rounded-none",
    text: "rounded-lg h-4",
  }

  return (
    <motion.div
      ref={ref}
      className={cn(
        "bg-gray-200",
        variantClasses[variant],
        className
      )}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      {...props}
    />
  )
})
PulseSkeleton.displayName = "PulseSkeleton"

// Gradient Skeleton with brand colors
const GradientSkeleton = React.forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, "animate" | "shimmer"> & { colorScheme?: "orange" | "blue" | "neutral" }
>(({ className, variant = "default", colorScheme = "neutral", ...props }, ref) => {
  const variantClasses = {
    default: "rounded-xl",
    circular: "rounded-full",
    rectangular: "rounded-none",
    text: "rounded-lg h-4",
  }

  const gradientClasses = {
    orange: "from-[#FF9933]/20 via-[#FF7A00]/10 to-[#FF9933]/20",
    blue: "from-[#5CBBF6]/20 via-[#4BA0D8]/10 to-[#5CBBF6]/20",
    neutral: "from-gray-200 via-gray-100 to-gray-200",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden bg-gradient-to-r",
        gradientClasses[colorScheme],
        "bg-[length:200%_100%]",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  )
})
GradientSkeleton.displayName = "GradientSkeleton"

// Card Skeleton preset
interface CardSkeletonProps {
  showAvatar?: boolean
  lines?: number
  className?: string
  shimmer?: boolean
}

const CardSkeleton = React.forwardRef<HTMLDivElement, CardSkeletonProps>(
  ({ showAvatar = true, lines = 3, className, shimmer = true }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-6 shadow-lg",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {showAvatar && (
          <Skeleton variant="circular" className="h-12 w-12 flex-shrink-0" shimmer={shimmer} />
        )}
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4" shimmer={shimmer} />
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              variant="text"
              className={cn("w-full", i === lines - 1 && "w-2/3")}
              shimmer={shimmer}
            />
          ))}
        </div>
      </div>
    </div>
  )
)
CardSkeleton.displayName = "CardSkeleton"

// Table Row Skeleton
interface TableRowSkeletonProps {
  columns?: number
  className?: string
  shimmer?: boolean
}

const TableRowSkeleton = React.forwardRef<HTMLDivElement, TableRowSkeletonProps>(
  ({ columns = 4, className, shimmer = true }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-4 p-4", className)}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" shimmer={shimmer} />
      ))}
    </div>
  )
)
TableRowSkeleton.displayName = "TableRowSkeleton"

// Stats Card Skeleton
const StatsCardSkeleton = React.forwardRef<
  HTMLDivElement,
  { className?: string; shimmer?: boolean }
>(({ className, shimmer = true }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-gray-200 bg-white p-6 shadow-lg",
      className
    )}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-24" shimmer={shimmer} />
        <Skeleton className="h-8 w-32" shimmer={shimmer} />
        <Skeleton className="h-3 w-20" shimmer={shimmer} />
      </div>
      <Skeleton variant="circular" className="h-14 w-14 flex-shrink-0" shimmer={shimmer} />
    </div>
  </div>
))
StatsCardSkeleton.displayName = "StatsCardSkeleton"

// List Skeleton
interface ListSkeletonProps {
  items?: number
  showAvatar?: boolean
  className?: string
  shimmer?: boolean
}

const ListSkeleton = React.forwardRef<HTMLDivElement, ListSkeletonProps>(
  ({ items = 5, showAvatar = true, className, shimmer = true }, ref) => (
    <div ref={ref} className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-colors duration-300">
          {showAvatar && <Skeleton variant="circular" className="h-10 w-10" shimmer={shimmer} />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" shimmer={shimmer} />
            <Skeleton className="h-3 w-1/2" shimmer={shimmer} />
          </div>
        </div>
      ))}
    </div>
  )
)
ListSkeleton.displayName = "ListSkeleton"

// Form Skeleton
interface FormSkeletonProps {
  fields?: number
  className?: string
  shimmer?: boolean
}

const FormSkeleton = React.forwardRef<HTMLDivElement, FormSkeletonProps>(
  ({ fields = 4, className, shimmer = true }, ref) => (
    <div ref={ref} className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" shimmer={shimmer} />
          <Skeleton className="h-12 w-full rounded-xl" shimmer={shimmer} />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-11 w-32 rounded-xl" shimmer={shimmer} />
        <Skeleton className="h-11 w-32 rounded-xl" shimmer={shimmer} />
      </div>
    </div>
  )
)
FormSkeleton.displayName = "FormSkeleton"

// Avatar Group Skeleton
interface AvatarGroupSkeletonProps {
  count?: number
  size?: "sm" | "md" | "lg"
  className?: string
  shimmer?: boolean
}

const AvatarGroupSkeleton = React.forwardRef<
  HTMLDivElement,
  AvatarGroupSkeletonProps
>(({ count = 5, size = "md", className, shimmer = true }, ref) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const spacingClasses = {
    sm: "-space-x-2",
    md: "-space-x-3",
    lg: "-space-x-4",
  }

  return (
    <div
      ref={ref}
      className={cn("flex items-center", spacingClasses[size], className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          variant="circular"
          className={cn(sizeClasses[size], "ring-2 ring-white")}
          shimmer={shimmer}
        />
      ))}
    </div>
  )
})
AvatarGroupSkeleton.displayName = "AvatarGroupSkeleton"

// Dashboard Grid Skeleton
interface DashboardSkeletonProps {
  cards?: number
  className?: string
  shimmer?: boolean
}

const DashboardSkeleton = React.forwardRef<HTMLDivElement, DashboardSkeletonProps>(
  ({ cards = 4, className, shimmer = true }, ref) => (
    <div
      ref={ref}
      className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}
    >
      {Array.from({ length: cards }).map((_, i) => (
        <StatsCardSkeleton key={i} shimmer={shimmer} />
      ))}
    </div>
  )
)
DashboardSkeleton.displayName = "DashboardSkeleton"

// Page Header Skeleton
const PageHeaderSkeleton = React.forwardRef<
  HTMLDivElement,
  { className?: string; shimmer?: boolean }
>(({ className, shimmer = true }, ref) => (
  <div ref={ref} className={cn("space-y-4", className)}>
    <div className="flex items-center justify-between">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-8 w-64" shimmer={shimmer} />
        <Skeleton className="h-4 w-96" shimmer={shimmer} />
      </div>
      <Skeleton className="h-10 w-32 rounded-xl" shimmer={shimmer} />
    </div>
  </div>
))
PageHeaderSkeleton.displayName = "PageHeaderSkeleton"

// Data Table Skeleton
interface DataTableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
  shimmer?: boolean
}

const DataTableSkeleton = React.forwardRef<HTMLDivElement, DataTableSkeletonProps>(
  ({ rows = 5, columns = 5, className, shimmer = true }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-lg", className)}
    >
      {/* Table Header */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 border-b border-gray-200">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" shimmer={shimmer} />
        ))}
      </div>
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} shimmer={shimmer} />
      ))}
    </div>
  )
)
DataTableSkeleton.displayName = "DataTableSkeleton"

export {
  Skeleton,
  ShimmerSkeleton,
  PulseSkeleton,
  GradientSkeleton,
  CardSkeleton,
  TableRowSkeleton,
  StatsCardSkeleton,
  ListSkeleton,
  FormSkeleton,
  AvatarGroupSkeleton,
  DashboardSkeleton,
  PageHeaderSkeleton,
  DataTableSkeleton,
}
