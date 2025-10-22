import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "border border-slate-200 rounded-lg mb-3 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md data-[state=open]:border-[#FF9933] data-[state=open]:shadow-lg",
      className
    )}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 px-5 text-left text-base font-semibold text-slate-700 transition-all duration-300 hover:bg-slate-50 data-[state=open]:bg-gradient-to-r data-[state=open]:from-orange-50 data-[state=open]:to-amber-50 data-[state=open]:text-[#FF7A00] [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg]:text-[#FF9933] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5CBBF6] focus-visible:ring-offset-2 touch-manipulation group",
        className
      )}
      {...props}
    >
      {children}
      <motion.svg
        className="h-5 w-5 text-slate-500 flex-shrink-0 transition-all duration-300 group-hover:text-[#FF9933]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
        animate={{ rotate: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M19 9l-7 7-7-7"
        />
      </motion.svg>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-base text-slate-600 transition-all duration-300 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("px-5 pb-5 pt-1 border-t border-slate-100", className)}
    >
      {children}
    </motion.div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
