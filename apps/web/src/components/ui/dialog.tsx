"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

export const Dialog = ({ open, onClose, children, className }: DialogProps) => {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl", className)}>
        {children}
      </div>
    </div>
  );
};

export const DialogHeader = ({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) => (
  <div className="flex items-start justify-between gap-4 border-b border-border p-5">
    <div className="flex-1">{children}</div>
    {onClose && (
      <button onClick={onClose} className="mt-0.5 rounded-lg p-1 text-muted-foreground hover:bg-muted" aria-label="Fermer">
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

export const DialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>
);

export const DialogBody = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("p-5", className)}>{children}</div>
);

export const DialogFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex items-center justify-end gap-3 border-t border-border p-5", className)}>{children}</div>
);
