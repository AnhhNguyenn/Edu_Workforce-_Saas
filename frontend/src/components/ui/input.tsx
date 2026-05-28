import * as React from "react"
import { cn } from "./stat-card" // Using cn from stat-card or move to lib/utils

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full relative">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-edu-border bg-white px-3.5 py-2 text-sm placeholder:text-edu-muted outline-none transition-all duration-200",
            "focus:border-edu-accent focus:ring-4 focus:ring-edu-accentLight/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-edu-danger focus:border-edu-danger focus:ring-edu-dangerLight/50",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-edu-danger">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
