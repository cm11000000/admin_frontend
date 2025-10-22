import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: "default" | "pills" | "underline"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-start gap-1 text-slate-600",
      variant === "default" &&
        "rounded-xl bg-white p-1.5 border border-slate-200 shadow-sm",
      variant === "pills" && "gap-2",
      variant === "underline" &&
        "border-b border-slate-200 gap-6 w-full",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: "default" | "pills" | "underline"
    icon?: React.ReactNode
  }
>(({ className, variant = "default", icon, children, ...props }, ref) => {
  const [, setIsActive] = React.useState(false)

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-base font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5CBBF6] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation select-none",
        variant === "default" &&
          "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF9933] data-[state=active]:to-[#FF7A00] data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-50 hover:text-slate-900",
        variant === "pills" &&
          "rounded-full border-2 border-slate-200 data-[state=active]:border-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF9933] data-[state=active]:to-[#FF7A00] data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900",
        variant === "underline" &&
          "rounded-none border-b-3 border-transparent pb-3 data-[state=active]:border-[#FF9933] data-[state=active]:text-[#FF7A00] data-[state=active]:font-bold hover:text-slate-900 hover:bg-slate-50/50",
        className
      )}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
      {...props}
    >
      {icon && (
        <span className="flex-shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
      {variant === "default" && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#FF9933] to-[#FF7A00] shadow-lg -z-10"
          layoutId="active-tab"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      )}
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
    animate?: boolean
  }
>(({ className, animate = true, children, ...props }, ref) => {
  const content = (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5CBBF6] focus-visible:ring-offset-2 rounded-xl",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Content>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {content}
      </motion.div>
    )
  }

  return content
})
TabsContent.displayName = TabsPrimitive.Content.displayName

// Icon Tab Component for mobile
interface IconTabTriggerProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof TabsTrigger>,
    "children"
  > {
  icon: React.ReactNode
  label: string
  badge?: string | number
}

const IconTabTrigger = React.forwardRef<
  React.ElementRef<typeof TabsTrigger>,
  IconTabTriggerProps
>(({ icon, label, badge, ...props }, ref) => (
  <TabsTrigger ref={ref} {...props}>
    <div className="flex flex-col items-center gap-1.5 min-w-[60px]">
      <div className="relative">
        <span className="text-xl" aria-hidden="true">
          {icon}
        </span>
        {badge && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#FF9933] to-[#FF7A00] text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md">
            {badge}
          </span>
        )}
      </div>
      <span className="text-xs font-medium truncate max-w-full">{label}</span>
    </div>
  </TabsTrigger>
))
IconTabTrigger.displayName = "IconTabTrigger"

export { Tabs, TabsList, TabsTrigger, TabsContent, IconTabTrigger }
