"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
    label?: string
  }
>(
  (
    {
      className,
      orientation = "horizontal",
      decorative = true,
      label,
      ...props
    },
    ref
  ) => {
    if (label) {
      return (
        <div
          className={cn(
            "relative flex items-center",
            orientation === "horizontal" ? "w-full py-4" : "flex-col h-full px-4"
          )}
        >
          <SeparatorPrimitive.Root
            ref={ref}
            decorative={decorative}
            orientation={orientation}
            className={cn(
              "shrink-0 bg-gray-200",
              orientation === "horizontal"
                ? "h-[1px] flex-1"
                : "w-[1px] flex-1",
              className
            )}
            {...props}
          />
          <span
            className={cn(
              "text-sm font-medium text-gray-500 bg-white whitespace-nowrap",
              orientation === "horizontal" ? "px-3" : "py-3"
            )}
          >
            {label}
          </span>
          <SeparatorPrimitive.Root
            decorative={decorative}
            orientation={orientation}
            className={cn(
              "shrink-0 bg-gray-200",
              orientation === "horizontal"
                ? "h-[1px] flex-1"
                : "w-[1px] flex-1"
            )}
          />
        </div>
      )
    }

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "shrink-0 bg-gray-200 opacity-100",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          className
        )}
        {...props}
      />
    )
  }
)
Separator.displayName = SeparatorPrimitive.Root.displayName

// Gradient Separator variant - using brand colors
const GradientSeparator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
    variant?: "orange" | "blue" | "neutral"
  }
>(({ className, orientation = "horizontal", variant = "neutral", ...props }, ref) => {
  const gradientClasses = {
    orange: orientation === "horizontal"
      ? "bg-gradient-to-r from-transparent via-[#FF9933] to-transparent"
      : "bg-gradient-to-b from-transparent via-[#FF9933] to-transparent",
    blue: orientation === "horizontal"
      ? "bg-gradient-to-r from-transparent via-[#5CBBF6] to-transparent"
      : "bg-gradient-to-b from-transparent via-[#5CBBF6] to-transparent",
    neutral: orientation === "horizontal"
      ? "bg-gradient-to-r from-transparent via-gray-300 to-transparent"
      : "bg-gradient-to-b from-transparent via-gray-300 to-transparent",
  }

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      orientation={orientation}
      className={cn(
        "shrink-0 opacity-60",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        gradientClasses[variant],
        className
      )}
      {...props}
    />
  )
})
GradientSeparator.displayName = "GradientSeparator"

// Dotted Separator variant
const DottedSeparator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    orientation={orientation}
    className={cn(
      "shrink-0 border-gray-300 opacity-100",
      orientation === "horizontal"
        ? "h-0 w-full border-t border-dotted"
        : "h-full w-0 border-l border-dotted",
      className
    )}
    {...props}
  />
))
DottedSeparator.displayName = "DottedSeparator"

// Dashed Separator variant
const DashedSeparator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    orientation={orientation}
    className={cn(
      "shrink-0 border-gray-300 opacity-100",
      orientation === "horizontal"
        ? "h-0 w-full border-t border-dashed"
        : "h-full w-0 border-l border-dashed",
      className
    )}
    {...props}
  />
))
DashedSeparator.displayName = "DashedSeparator"

export { Separator, GradientSeparator, DottedSeparator, DashedSeparator }
