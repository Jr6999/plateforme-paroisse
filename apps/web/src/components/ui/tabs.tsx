"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextType = { active: string; setActive: (value: string) => void };
const TabsContext = React.createContext<TabsContextType>({ active: "", setActive: () => {} });

export const Tabs = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) => {
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const active = value ?? internal;
  const setActive = (v: string) => {
    setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex gap-1 rounded-xl bg-muted p-1", className)}>{children}</div>
);

export const TabsTrigger = ({
  value,
  children,
  className
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const { active, setActive } = React.useContext(TabsContext);
  const isActive = active === value;
  return (
    <button
      type="button"
      onClick={() => setActive(value)}
      className={cn(
        "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      , className)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({
  value,
  children,
  className
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const { active } = React.useContext(TabsContext);
  if (active !== value) return null;
  return <div className={className}>{children}</div>;
};
