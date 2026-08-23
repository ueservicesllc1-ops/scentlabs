import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "amber" | "emerald" | "red" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-lab-800 text-lab-300 border-lab-700",
    amber: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    red: "bg-red-500/20 text-red-300 border-red-500/40",
    outline: "bg-transparent text-lab-400 border-lab-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function Alert({
  variant = "info",
  title,
  children,
}: {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  children: React.ReactNode;
}) {
  const styles = {
    info: "bg-lab-900/60 border-lab-700 text-lab-300",
    success: "bg-emerald-950/40 border-emerald-500/40 text-emerald-300",
    warning: "bg-amber-950/40 border-amber-500/40 text-amber-300",
    error: "bg-red-950/40 border-red-500/40 text-red-300",
  };

  return (
    <div className={cn("p-4 rounded-xl border text-xs font-mono space-y-1", styles[variant])}>
      {title && <div className="font-bold uppercase tracking-wider">{title}</div>}
      <div className="leading-relaxed text-[11px] opacity-90">{children}</div>
    </div>
  );
}

export function LoadingState({ message = "Loading lab assets..." }: { message?: string }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center space-y-3">
      <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      <p className="text-xs font-mono text-lab-400 uppercase tracking-widest">{message}</p>
    </div>
  );
}

export function EmptyState({
  title = "No items found",
  description = "There are no records currently available.",
  actionLabel,
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="py-16 px-4 text-center rounded-xl border border-lab-800 bg-lab-950/40 space-y-3 max-w-md mx-auto font-mono">
      <h3 className="text-sm font-bold text-white uppercase">{title}</h3>
      <p className="text-xs text-lab-400 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 text-xs font-bold uppercase bg-lab-800 text-white hover:bg-lab-700 rounded transition border border-lab-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
