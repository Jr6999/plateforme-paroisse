import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "outline" | "gold" | "muted";
};

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
      variant === "default" && "bg-primary text-primary-foreground",
      variant === "outline" && "border border-border bg-background",
      variant === "gold" && "bg-gold/15 text-gold",
      variant === "muted" && "bg-muted text-muted-foreground",
      className
    )}
    {...props}
  />
);
