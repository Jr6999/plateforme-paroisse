import * as React from "react";
import { cn, initials } from "@/lib/utils";

type AvatarProps = {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeMap = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl"
};

export const Avatar = ({ src, name = "", size = "md", className }: AvatarProps) => (
  <span
    className={cn(
      "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gold/20 font-semibold text-gold",
      sizeMap[size],
      className
    )}
  >
    {src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name} className="h-full w-full object-cover" />
    ) : (
      initials(name) || "?"
    )}
  </span>
);
