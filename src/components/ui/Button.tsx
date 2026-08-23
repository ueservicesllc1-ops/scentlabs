import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-mono font-bold tracking-wider uppercase transition rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none";

    const variantStyles = {
      primary: "bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 hover:brightness-110 shadow-md shadow-amber-500/10",
      secondary: "bg-lab-800 text-white hover:bg-lab-700 border border-lab-700",
      outline: "bg-transparent text-lab-300 border border-lab-700 hover:border-lab-500 hover:text-white",
      ghost: "bg-transparent text-lab-400 hover:text-white hover:bg-lab-900",
      danger: "bg-red-600 text-white hover:bg-red-500",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2.5 text-xs",
      lg: "px-6 py-3.5 text-sm",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
