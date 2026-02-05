import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-2 border-nb-border placeholder:text-muted-foreground focus-visible:border-nb-blue focus-visible:ring-0 focus-visible:shadow-nb-sm aria-invalid:ring-0 aria-invalid:border-nb-pink dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-none bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
