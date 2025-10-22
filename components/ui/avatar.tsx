import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-white transition-all duration-300",
  {
    variants: {
      size: {
        xs: "h-8 w-8 text-xs",
        sm: "h-10 w-10 text-sm",
        md: "h-12 w-12 text-base",
        lg: "h-16 w-16 text-lg",
        xl: "h-20 w-20 text-xl",
        "2xl": "h-24 w-24 text-2xl",
      },
      ring: {
        default: "ring-gray-200",
        primary: "ring-gradient-to-r from-[#FF9933] to-[#FF7A00]",
        blue: "ring-gradient-to-r from-[#5CBBF6] to-[#4BA0D8]",
        success: "ring-green-500",
        warning: "ring-yellow-500",
        danger: "ring-red-500",
        none: "ring-0 ring-offset-0",
      },
    },
    defaultVariants: {
      size: "md",
      ring: "default",
    },
  }
)

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  fallback?: string
  animate?: boolean
  status?: "online" | "offline" | "away" | "busy"
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(
  (
    {
      className,
      size,
      ring,
      src,
      alt,
      fallback,
      animate = true,
      status,
      ...props
    },
    ref
  ) => {
    const avatarElement = (
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          avatarVariants({ size, ring }),
          "group hover:shadow-lg hover:ring-4 transition-all duration-300",
          className
        )}
        {...props}
      >
        <AvatarPrimitive.Image
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <AvatarPrimitive.Fallback
          className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 font-semibold transition-all duration-300"
          delayMs={600}
        >
          {fallback || getInitials(alt || "User")}
        </AvatarPrimitive.Fallback>

        {/* Status indicator */}
        {status && (
          <span
            className={cn(
              "absolute bottom-0 right-0 block rounded-full ring-2 ring-white transition-all duration-300",
              size === "xs" && "h-2 w-2",
              size === "sm" && "h-2.5 w-2.5",
              size === "md" && "h-3 w-3",
              size === "lg" && "h-4 w-4",
              (size === "xl" || size === "2xl") && "h-5 w-5",
              status === "online" && "bg-green-500 shadow-lg shadow-green-500/50",
              status === "offline" && "bg-gray-400",
              status === "away" && "bg-yellow-500 shadow-lg shadow-yellow-500/50",
              status === "busy" && "bg-gradient-to-r from-[#FF9933] to-[#FF7A00] shadow-lg shadow-orange-500/50"
            )}
            aria-label={`Status: ${status}`}
          >
            {status === "online" && (
              <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
            )}
          </span>
        )}
      </AvatarPrimitive.Root>
    )

    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="inline-block"
        >
          {avatarElement}
        </motion.div>
      )
    }

    return avatarElement
  }
)
Avatar.displayName = AvatarPrimitive.Root.displayName

// Avatar Group for displaying multiple avatars
interface AvatarGroupProps {
  children: React.ReactNode
  max?: number
  size?: AvatarProps["size"]
  className?: string
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ children, max = 5, size = "md", className }, ref) => {
    const childrenArray = React.Children.toArray(children)
    const displayedChildren = childrenArray.slice(0, max)
    const remainingCount = childrenArray.length - max

    const overlapClass = {
      xs: "-space-x-2",
      sm: "-space-x-3",
      md: "-space-x-3",
      lg: "-space-x-4",
      xl: "-space-x-5",
      "2xl": "-space-x-6",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center hover:space-x-1 transition-all duration-300",
          overlapClass[size || "md"],
          className
        )}
        role="group"
      >
        {displayedChildren.map((child, index) => (
          <div
            key={index}
            className="relative transition-transform duration-300 hover:z-50 hover:scale-110"
            style={{ zIndex: max - index }}
          >
            {child}
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className={cn(
              avatarVariants({ size, ring: "default" }),
              "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 font-semibold flex items-center justify-center hover:from-gray-300 hover:to-gray-400 transition-all duration-300 cursor-pointer"
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    )
  }
)
AvatarGroup.displayName = "AvatarGroup"

// Helper function to get initials from name
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) {
    return words[0]?.substring(0, 2).toUpperCase() || ''
  }
  const first = words[0]?.[0] || '';
  const last = words[words.length - 1]?.[0] || '';
  return (first + last).toUpperCase();
}

// User Avatar with additional info
interface UserAvatarProps extends AvatarProps {
  name?: string
  email?: string
  showInfo?: boolean
}

const UserAvatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  UserAvatarProps
>(({ name, email, showInfo = false, ...props }, ref) => {
  if (showInfo) {
    return (
      <div className="flex items-center gap-3 group">
        <Avatar ref={ref} alt={name} {...props} />
        <div className="flex-1 min-w-0">
          {name && (
            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#FF7A00] transition-colors duration-300">
              {name}
            </p>
          )}
          {email && (
            <p className="text-xs text-gray-600 truncate">
              {email}
            </p>
          )}
        </div>
      </div>
    )
  }

  return <Avatar ref={ref} alt={name} {...props} />
})
UserAvatar.displayName = "UserAvatar"

export { Avatar, AvatarGroup, UserAvatar, avatarVariants }
