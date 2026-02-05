import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-none border-2 border-nb-border/20", className)}
      {...props}
    />
  )
}

export { Skeleton }
