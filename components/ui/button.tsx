import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/* 
  Updated to match 'Sleek' design:
  - Rounded corners (rounded-xl/2xl)
  - Orange primary color
  - Subtle shadows
*/
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
  {
    variants: {
      variant: {
        default: 'bg-primary text-white shadow-sm hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 shadow-sm',
        outline:
          'border border-border bg-card shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-primary/20',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent hover:border-border/50',
        ghost:
          'hover:bg-accent/50 hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        sleek: 'bg-white border border-border text-foreground shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5'
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-9 rounded-[12px] px-3',
        lg: 'h-12 rounded-[16px] px-8 text-base',
        icon: 'size-10 rounded-[14px]',
        'icon-sm': 'size-8 rounded-[10px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
