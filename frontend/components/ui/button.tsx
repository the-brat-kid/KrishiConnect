import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.97] active:transition-transform",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs active:shadow-none",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        emerald: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs",
        glass: "btn-liquid-glass text-foreground hover:text-white",
        "glass-primary": "btn-liquid-glass-primary text-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  isLoading?: boolean
  loadingText?: string
  spinnerPlacement?: "start" | "end"
  spinner?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      isLoading = false,
      loadingText,
      spinnerPlacement = "start",
      spinner,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isCurrentlyLoading = loading || isLoading
    const isDisabled = disabled || isCurrentlyLoading

    const spinnerNode = spinner || (
      <Spinner
        size={size === "sm" ? "xs" : size === "lg" ? "md" : "sm"}
        variant={
          variant === "outline" || variant === "ghost" || variant === "secondary"
            ? "default"
            : "white"
        }
      />
    )

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          aria-busy={isCurrentlyLoading || undefined}
          aria-disabled={isDisabled || undefined}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, className }),
          isCurrentlyLoading && "cursor-wait opacity-80"
        )}
        ref={ref}
        disabled={isDisabled}
        aria-busy={isCurrentlyLoading}
        {...props}
      >
        {isCurrentlyLoading && spinnerPlacement === "start" && (
          <span className="mr-2 inline-flex items-center">{spinnerNode}</span>
        )}
        <span>{isCurrentlyLoading && loadingText ? loadingText : children}</span>
        {isCurrentlyLoading && spinnerPlacement === "end" && (
          <span className="ml-2 inline-flex items-center">{spinnerNode}</span>
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
