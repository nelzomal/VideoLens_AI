import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md px-3 py-2 text-sm text-gray-900",
          "border border-gray-300 bg-white",
          "transition-colors duration-200",
          "placeholder:text-gray-500",
          "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
          "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
