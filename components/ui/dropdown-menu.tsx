import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-pointer select-none items-center justify-between gap-2",
      "rounded-xl px-3 py-3 text-sm outline-none",
      "transition-all duration-200",
      "hover:bg-gray-100/80 hover:text-gray-900",
      "focus:bg-gray-100 focus:text-gray-900",
      "data-[state=open]:bg-gradient-to-r data-[state=open]:from-[#5CBBF6]/10 data-[state=open]:to-[#4BA0D8]/10",
      "data-[state=open]:text-[#5CBBF6]",
      "touch-manipulation",
      inset && "pl-10",
      className
    )}
    {...props}
  >
    <span className="flex items-center gap-2">{children}</span>
    <motion.svg
      className="h-4 w-4 ml-auto flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      animate={{
        x: props.open ? 2 : 0,
      }}
      transition={{ duration: 0.2 }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </motion.svg>
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[12rem] overflow-hidden",
      "rounded-2xl border border-gray-200",
      "bg-white/95 backdrop-blur-xl",
      "p-1.5 text-gray-900",
      "shadow-[0_10px_40px_rgba(0,0,0,0.12)]",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      "data-[side=bottom]:slide-in-from-top-2",
      "data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2",
      "data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
    animate?: boolean
  }
>(({ className, sideOffset = 4, animate = true, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <AnimatePresence>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden",
          "rounded-2xl border border-gray-200",
          "bg-white/95 backdrop-blur-xl",
          "p-1.5 text-gray-900",
          "shadow-[0_10px_40px_rgba(0,0,0,0.12)]",
          "will-change-[opacity,transform]",
          animate && [
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2",
            "data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2",
            "data-[side=top]:slide-in-from-bottom-2",
          ],
          className
        )}
        {...props}
      />
    </AnimatePresence>
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
    icon?: React.ReactNode
    shortcut?: string
    variant?: "default" | "danger" | "success"
  }
>(({ className, inset, icon, shortcut, variant = "default", children, ...props }, ref) => {
  const variantStyles = {
    default: "hover:bg-gray-100/80 focus:bg-gray-100 hover:text-gray-900",
    danger: "hover:bg-red-50 focus:bg-red-100 hover:text-red-600 focus:text-red-700",
    success: "hover:bg-green-50 focus:bg-green-100 hover:text-green-600 focus:text-green-700"
  }

  const iconStyles = {
    default: "text-gray-500",
    danger: "text-red-500",
    success: "text-green-500"
  }

  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2",
        "rounded-xl px-3 py-2.5 text-sm outline-none",
        "transition-all duration-200",
        variantStyles[variant],
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "touch-manipulation group",
        inset && "pl-10",
        className
      )}
      {...props}
    >
      {icon && (
        <motion.span
          className={cn(
            "flex-shrink-0 transition-transform duration-200",
            iconStyles[variant],
            "group-hover:scale-110"
          )}
          aria-hidden="true"
        >
          {icon}
        </motion.span>
      )}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <span className="ml-auto text-xs text-gray-400 font-mono tracking-wide">
          {shortcut}
        </span>
      )}
    </DropdownMenuPrimitive.Item>
  )
})
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center gap-2",
      "rounded-xl py-2.5 pl-10 pr-3 text-sm outline-none",
      "transition-all duration-200",
      "hover:bg-gray-100/80 focus:bg-gray-100",
      "data-[state=checked]:bg-gradient-to-r",
      "data-[state=checked]:from-[#FF9933]/10 data-[state=checked]:to-[#FF7A00]/10",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "touch-manipulation",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-3 flex h-5 w-5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
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
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center gap-2",
      "rounded-xl py-2.5 pl-10 pr-3 text-sm outline-none",
      "transition-all duration-200",
      "hover:bg-gray-100/80 focus:bg-gray-100",
      "data-[state=checked]:bg-gradient-to-r",
      "data-[state=checked]:from-[#5CBBF6]/10 data-[state=checked]:to-[#4BA0D8]/10",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "touch-manipulation",
      className
    )}
    {...props}
  >
    <span className="absolute left-3 flex h-5 w-5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <motion.div
          className="h-2.5 w-2.5 bg-[#5CBBF6] rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-3 py-2 text-xs font-semibold uppercase tracking-wide",
      "text-gray-500",
      inset && "pl-10",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn(
      "my-2 mx-3 h-px",
      "bg-gradient-to-r from-transparent via-gray-200 to-transparent",
      className
    )}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-wide text-gray-400 font-mono",
        className
      )}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

// Enhanced dropdown menu with header
const DropdownMenuHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-3 py-3 border-b border-gray-200",
      "bg-gradient-to-r from-gray-50 to-gray-50/50",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
DropdownMenuHeader.displayName = "DropdownMenuHeader"

// Enhanced dropdown menu with footer
const DropdownMenuFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-3 py-3 border-t border-gray-200",
      "bg-gradient-to-r from-gray-50 to-gray-50/50",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
DropdownMenuFooter.displayName = "DropdownMenuFooter"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuHeader,
  DropdownMenuFooter,
}