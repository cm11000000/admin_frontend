import * as React from "react"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-2xl border text-card-foreground transition-all duration-300 ease-out overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-white border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.1),0_6px_10px_rgba(0,0,0,0.05)]",
        glass:
          "bg-white/80 border-white/20 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)]",
        gradient:
          "bg-gradient-to-br from-orange-50/80 via-white to-sky-50/60 border-0 shadow-[0_8px_24px_rgba(255,153,51,0.12),0_2px_8px_rgba(92,187,246,0.08)] hover:shadow-[0_12px_32px_rgba(255,153,51,0.15),0_4px_12px_rgba(92,187,246,0.1)]",
        premium:
          "bg-white border-0 shadow-[0_4px_20px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)]",
        outlined:
          "bg-white/50 border-2 border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-[#FF9933] hover:shadow-[0_4px_12px_rgba(255,153,51,0.15),0_2px_6px_rgba(255,153,51,0.08)]",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-0.5 hover:scale-[1.005] active:scale-[0.998]",
        glow: "hover:shadow-[0_0_30px_rgba(255,153,51,0.3),0_8px_24px_rgba(255,153,51,0.2),0_4px_12px_rgba(92,187,246,0.15)]",
        float: "hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.08)]",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      hover: "lift",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  animate?: boolean
  delay?: number
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      padding,
      hover,
      animate = true,
      delay = 0,
      children,
      ...props
    },
    ref
  ) => {
    const cardContent = (
      <div
        className={cn(cardVariants({ variant, padding, hover, className }))}
        ref={ref}
        {...props}
      >
        {/* Premium gradient overlay */}
        {variant === "premium" && (
          <div
            className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.03] via-transparent to-sky-500/[0.02] pointer-events-none"
            aria-hidden="true"
          />
        )}

        {/* Glass effect background */}
        {variant === "glass" && (
          <div
            className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent pointer-events-none"
            aria-hidden="true"
          />
        )}

        <div className="relative z-10">{children}</div>
      </div>
    )

    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay,
            ease: [0.21, 1.0, 0.81, 0.99],
          }}
          className="transform-gpu"
        >
          {cardContent}
        </motion.div>
      )
    }

    return cardContent
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2.5 pb-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-bold leading-tight tracking-tight text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text",
      className
    )}
    {...props}
  >
    {children}
  </h3>
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-gray-600 leading-relaxed",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-4 pt-6", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Specialized Stats Card Component
interface StatsCardProps extends CardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  (
    {
      title,
      value,
      description,
      icon,
      trend,
      className,
      animate = true,
      ...props
    },
    ref
  ) => (
    <Card
      ref={ref}
      variant="premium"
      hover="float"
      animate={animate}
      className={cn("group relative", className)}
      {...props}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-500 mb-3 truncate uppercase tracking-wide">
              {title}
            </p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent truncate">
                {value}
              </h2>
              {trend && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className={cn(
                    "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm",
                    trend.positive
                      ? "text-green-700 bg-gradient-to-r from-green-50 to-green-100 ring-1 ring-green-200/50"
                      : "text-red-700 bg-gradient-to-r from-red-50 to-red-100 ring-1 ring-red-200/50"
                  )}
                >
                  <span aria-hidden="true" className="text-sm">{trend.positive ? "↗" : "↘"}</span>
                  <span>
                    {trend.value}% {trend.label}
                  </span>
                </motion.div>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {icon && (
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex-shrink-0 p-3.5 bg-gradient-to-br from-[#FF9933] via-orange-500 to-orange-600 rounded-xl md:rounded-2xl text-white shadow-[0_4px_14px_rgba(255,153,51,0.4),0_1px_3px_rgba(255,153,51,0.3)] group-hover:shadow-[0_6px_20px_rgba(255,153,51,0.5),0_2px_6px_rgba(255,153,51,0.4)] transition-shadow"
            >
              {icon}
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
)
StatsCard.displayName = "StatsCard"

// Feature Card Component
interface FeatureCardProps extends CardProps {
  title: string
  description: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  (
    { title, description, icon, action, className, animate = true, ...props },
    ref
  ) => (
    <Card
      ref={ref}
      variant="glass"
      hover="lift"
      animate={animate}
      className={cn("group text-center relative overflow-hidden", className)}
      {...props}
    >
      <CardContent className="p-6 md:p-8 relative">
        {icon && (
          <motion.div
            whileHover={{ scale: 1.08, rotate: -3 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="mx-auto w-16 h-16 md:w-18 md:h-18 bg-gradient-to-br from-[#FF9933] via-orange-500 to-[#5CBBF6] rounded-2xl flex items-center justify-center text-white shadow-[0_4px_20px_rgba(255,153,51,0.35),0_2px_8px_rgba(92,187,246,0.25)] mb-6 group-hover:shadow-[0_6px_28px_rgba(255,153,51,0.45),0_3px_12px_rgba(92,187,246,0.35)] transition-all duration-300 ring-2 ring-white/50"
          >
            {icon}
          </motion.div>
        )}
        <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-3 group-hover:from-[#FF9933] group-hover:to-[#5CBBF6] transition-all duration-300">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed mb-6 max-w-md mx-auto">
          {description}
        </p>
        {action && <div className="mt-auto">{action}</div>}
      </CardContent>
    </Card>
  )
)
FeatureCard.displayName = "FeatureCard"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  StatsCard,
  FeatureCard,
  cardVariants,
}
