import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-2 border-nb-border h-9 w-full min-w-0 rounded-none bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-nb-blue focus-visible:ring-0 focus-visible:shadow-nb-sm",
        "aria-invalid:ring-0 aria-invalid:border-nb-pink",
        className
      )}
      {...props}
    />
  )
}

export { Input }
