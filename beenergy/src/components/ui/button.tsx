import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-turquesa disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-verde-profesional text-white hover:bg-verde-profesional/90 hover:scale-105":
              variant === "default",
            "border-2 border-verde-profesional text-verde-profesional hover:bg-verde-profesional/10":
              variant === "outline",
            "hover:bg-gris-claro": variant === "ghost",
          },
          {
            "h-10 px-6 py-2": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-12 px-8": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
