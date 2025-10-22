import * as React from "react"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Simple switch implementation without Radix UI
const SwitchPrimitives = {
  Root: React.forwardRef<HTMLButtonElement, any>(({ children, ...props }, ref) => <button ref={ref} type="button" role="switch" {...props}>{children}</button>),
  Thumb: React.forwardRef<HTMLSpanElement, any>(({ ...props }, ref) => <span ref={ref} {...props} />)
}
SwitchPrimitives.Root.displayName = "SwitchRoot"
SwitchPrimitives.Thumb.displayName = "SwitchThumb"

const switchVariants = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5CBBF6] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 hover:scale-105 touch-manipulation",
  {
    variants: {
      size: {
        sm: "h-5 w-9",
        md: "h-6 w-11",
        lg: "h-7 w-14",
      },
      variant: {
        default:
          "bg-gray-200 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FF9933] data-[state=checked]:to-[#FF7A00]",
        success:
          "bg-gray-200 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-green-600",
        warning:
          "bg-gray-200 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-yellow-500 data-[state=checked]:to-yellow-600",
        danger:
          "bg-gray-200 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-500 data-[state=checked]:to-red-600",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

const thumbVariants = cva(
  "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-all duration-300",
  {
    variants: {
      size: {
        sm: "h-4 w-4 data-[state=checked]:translate-x-4",
        md: "h-5 w-5 data-[state=checked]:translate-x-5",
        lg: "h-6 w-6 data-[state=checked]:translate-x-7",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchVariants> {
  label?: string
  description?: string
  error?: string
  animate?: boolean
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(
  (
    {
      className,
      size,
      variant,
      label,
      description,
      error,
      animate = true,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const switchId = props.id || generatedId

    const switchElement = (
      <SwitchPrimitives.Root
        id={switchId}
        className={cn(switchVariants({ size, variant }), className)}
        {...props}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={
          description
            ? `${switchId}-description`
            : error
            ? `${switchId}-error`
            : undefined
        }
      >
        <SwitchPrimitives.Thumb className={cn(thumbVariants({ size }))} asChild={animate}>
          {animate ? (
            <motion.span
              layout
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
            />
          ) : (
            <span />
          )}
        </SwitchPrimitives.Thumb>
      </SwitchPrimitives.Root>
    )

    if (label || description) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {switchElement}
            <div className="flex-1 min-w-0">
              {label && (
                <label
                  htmlFor={switchId}
                  className="text-base font-medium text-slate-900 cursor-pointer select-none leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {label}
                </label>
              )}
              {description && (
                <p
                  id={`${switchId}-description`}
                  className="text-sm text-slate-600 mt-1.5 leading-relaxed"
                >
                  {description}
                </p>
              )}
            </div>
          </div>
          {error && (
            <motion.p
              id={`${switchId}-error`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-red-600 flex items-center gap-1.5 ml-14"
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

    return switchElement
  }
)
Switch.displayName = SwitchPrimitives.Root.displayName

// Switch with icons
interface IconSwitchProps extends SwitchProps {
  checkedIcon?: React.ReactNode
  uncheckedIcon?: React.ReactNode
}

const IconSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  IconSwitchProps
>(
  (
    {
      checkedIcon,
      uncheckedIcon,
      size = "lg",
      animate = true,
      className,
      ...props
    },
    ref
  ) => {
    const [isChecked, setIsChecked] = React.useState(props.checked || props.defaultChecked || false)

    const handleCheckedChange = (checked: boolean) => {
      setIsChecked(checked)
      props.onCheckedChange?.(checked)
    }

    return (
      <SwitchPrimitives.Root
        ref={ref}
        className={cn(
          switchVariants({ size, variant: props.variant }),
          "relative",
          className
        )}
        {...props}
        onCheckedChange={handleCheckedChange}
      >
        {/* Icons */}
        <div className="absolute inset-0 flex items-center justify-between px-1.5 text-white">
          {checkedIcon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: isChecked ? 1 : 0,
                scale: isChecked ? 1 : 0.5,
              }}
              transition={{ duration: 0.2 }}
              className="text-xs"
            >
              {checkedIcon}
            </motion.div>
          )}
          {uncheckedIcon && (
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              animate={{
                opacity: !isChecked ? 1 : 0,
                scale: !isChecked ? 1 : 0.5,
              }}
              transition={{ duration: 0.2 }}
              className="text-xs ml-auto"
            >
              {uncheckedIcon}
            </motion.div>
          )}
        </div>
        <SwitchPrimitives.Thumb className={cn(thumbVariants({ size }))} asChild={animate}>
          {animate ? (
            <motion.span
              layout
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
            />
          ) : (
            <span />
          )}
        </SwitchPrimitives.Thumb>
      </SwitchPrimitives.Root>
    )
  }
)
IconSwitch.displayName = "IconSwitch"

// Switch Group for multiple switches
interface SwitchGroupProps {
  label?: string
  description?: string
  error?: string
  children: React.ReactNode
  className?: string
}

const SwitchGroup = React.forwardRef<HTMLDivElement, SwitchGroupProps>(
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
        <div className="space-y-4">{children}</div>
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
SwitchGroup.displayName = "SwitchGroup"

export { Switch, IconSwitch, SwitchGroup, switchVariants }
