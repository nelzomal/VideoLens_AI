import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-blue-500 text-white shadow-sm hover:bg-blue-600 active:bg-blue-700",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600 active:bg-red-700",
        outline:
          "border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 active:bg-gray-100",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300",
        ghost: "hover:bg-gray-100 text-gray-700 active:bg-gray-200",
        link: "text-blue-500 underline-offset-4 hover:underline",
        "mui-contained":
          "bg-blue-500 text-white shadow-sm hover:bg-blue-600 active:bg-blue-700",
        "mui-outlined":
          "border-2 border-blue-500 text-blue-500 hover:bg-blue-50 active:bg-blue-100",
        "mui-text": "text-blue-500 hover:bg-blue-50 active:bg-blue-100",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
