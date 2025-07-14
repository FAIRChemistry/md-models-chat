import React from 'react'
import { cn } from "@/lib/utils"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'accent'
}

export function Spinner({ size = 'md', color = 'primary', className, ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      className={cn(
        "inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
        {
          'h-4 w-4 border-2': size === 'sm',
          'h-8 w-8 border-4': size === 'md',
          'h-12 w-12 border-4': size === 'lg',
        },
        {
          'text-primary': color === 'primary',
          'text-secondary': color === 'secondary',
          'text-accent': color === 'accent',
        },
        className
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

