import * as React from "react"
import clsx from "clsx"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "danger" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-brand-blue text-white hover:bg-blue-700 shadow-lg hover:shadow-brand-blue/25 hover:-translate-y-0.5 focus:ring-brand-blue": variant === "default",
            "border border-gray-200 bg-white text-brand-navy hover:bg-gray-50 hover:border-gray-300 shadow-sm focus:ring-gray-200": variant === "outline",
            "bg-white text-brand-secondary border border-gray-200 hover:border-brand-blue/30 hover:bg-blue-50 focus:ring-brand-blue": variant === "secondary",
            "bg-transparent text-brand-secondary hover:bg-gray-100 hover:text-brand-navy": variant === "ghost",
            "bg-red-50 text-brand-danger hover:bg-red-100 focus:ring-red-500": variant === "danger",
            
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-12 rounded-xl px-8": size === "lg",
            "h-10 w-10 p-2": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
