// @/components/ui/progress.js (or .tsx)

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef(({ className, indicatorColor, value, ...props }, ref) => (
    <ProgressPrimitive.Root
        ref={ref}
        className={cn(
            "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
            className
        )}
        {...props}>
        <ProgressPrimitive.Indicator
            className="h-full w-full flex-1 transition-all"
            style={{
                transform: `translateX(-${100 - (value || 0)}%)`,
                backgroundColor: indicatorColor,
            }}
        />
    </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }