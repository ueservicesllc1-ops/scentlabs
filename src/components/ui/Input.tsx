import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = "text", ...props }, ref) => {
    return (
      <div className="space-y-1 w-full text-left font-mono text-xs">
        {label && <label className="block text-lab-400 font-medium uppercase tracking-wider text-[10px]">{label}</label>}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500 transition text-xs",
            error && "border-red-500 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-[10px] text-red-400">{error}</p>}
        {helperText && !error && <p className="text-[10px] text-lab-500">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
