import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-6 text-gray-700 transition-colors",
  {
    variants: {
      error: {
        true: "text-red-500",
      },
      disabled: {
        true: "text-gray-400 cursor-not-allowed",
      },
      required: {
        true: "after:content-['*'] after:ml-0.5 after:text-red-500",
      },
    },
  }
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants> & {
      error?: boolean;
      required?: boolean;
    }
>(({ className, error, required, disabled, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants({ error, required, disabled }), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
