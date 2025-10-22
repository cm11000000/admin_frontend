import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    label?: string
    error?: string
    size?: "sm" | "md" | "lg"
  }
>(({ className, children, label, error, size = "md", ...props }, ref) => {
  const generatedId = React.useId()
  const [isFocused, setIsFocused] = React.useState(false)

  const sizeClasses = {
    sm: "h-10 px-3 py-2 text-sm rounded-lg",
    md: "h-12 px-4 py-3 text-base rounded-xl",
    lg: "h-14 px-5 py-4 text-lg rounded-2xl"
  }

  return (
    <div className="space-y-2 w-full">
      {label && (
        <motion.label
          htmlFor={generatedId}
          className={cn(
            "block text-sm font-medium transition-all duration-300",
            error
              ? "text-red-600"
              : isFocused
              ? "text-[#5CBBF6]"
              : "text-gray-700"
          )}
          animate={{
            scale: isFocused ? 1.02 : 1,
            fontWeight: isFocused ? 600 : 500
          }}
        >
          {label}
        </motion.label>
      )}
      <SelectPrimitive.Trigger
        ref={ref}
        id={generatedId}
        className={cn(
          "flex w-full items-center justify-between gap-2",
          "bg-gray-50/50 border-2 border-gray-200",
          "text-gray-900 placeholder-gray-400",
          "transition-all duration-300",
          "hover:bg-white hover:border-gray-300",
          "focus:outline-none focus:bg-white",
          "focus:border-[#5CBBF6] focus:ring-4 focus:ring-[#5CBBF6]/10",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-gray-50/50",
          "touch-manipulation",
          "shadow-sm hover:shadow-md focus:shadow-lg",
          sizeClasses[size],
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
          className
        )}
        aria-invalid={!!error}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      >
        <span className="truncate text-left">{children}</span>
        <SelectPrimitive.Icon asChild>
          <motion.svg
            className={cn(
              "flex-shrink-0 transition-colors duration-300",
              isFocused ? "text-[#5CBBF6]" : "text-gray-400",
              size === "sm" && "h-4 w-4",
              size === "md" && "h-5 w-5",
              size === "lg" && "h-6 w-6"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{
              rotate: props.open ? 180 : 0,
              scale: isFocused ? 1.1 : 1
            }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </motion.svg>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-red-600 flex items-center gap-1.5 mt-1.5"
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
      </AnimatePresence>
    </div>
  )
})
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-2",
      "bg-gradient-to-b from-white to-transparent",
      "text-gray-400 hover:text-gray-600",
      className
    )}
    {...props}
  >
    <motion.svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 15l7-7 7 7"
      />
    </motion.svg>
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-2",
      "bg-gradient-to-t from-white to-transparent",
      "text-gray-400 hover:text-gray-600",
      className
    )}
    {...props}
  >
    <motion.svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      whileHover={{ y: 2 }}
      transition={{ duration: 0.2 }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </motion.svg>
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden",
        "rounded-2xl border border-gray-200",
        "bg-white/95 backdrop-blur-xl",
        "text-gray-900",
        "shadow-[0_10px_40px_rgba(0,0,0,0.12)]",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1.5",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </motion.div>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "px-3 py-2 text-xs font-semibold uppercase tracking-wide",
      "text-gray-500",
      className
    )}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center",
      "rounded-xl py-3 px-3 text-sm outline-none",
      "transition-all duration-200",
      "hover:bg-gray-100/80",
      "focus:bg-gray-100",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FF9933]/10 data-[state=checked]:to-[#FF7A00]/10",
      "data-[state=checked]:text-[#FF9933] data-[state=checked]:font-medium",
      "data-[state=checked]:shadow-sm",
      className
    )}
    {...props}
  >
    <span className="absolute left-3 flex h-5 w-5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <motion.svg
          className="h-4 w-4 text-[#FF9933]"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </motion.svg>
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText className="pl-6">
      {children}
    </SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn(
      "my-2 mx-3 h-px",
      "bg-gradient-to-r from-transparent via-gray-200 to-transparent",
      className
    )}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
