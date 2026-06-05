import * as React from "react"
import { cn } from "./stat-card"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full relative">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-edu-border bg-white px-3.5 py-2.5 text-sm placeholder:text-edu-muted outline-none transition-all duration-200 resize-y",
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
Textarea.displayName = "Textarea"

export { Textarea }
