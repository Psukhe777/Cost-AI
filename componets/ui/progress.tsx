import * as React from "react";
import { cn } from "@/lib/utils";

export function Progress({
  value,
  className
}: {
  value: number;
  className?: string;
}) {
  const safeValue = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;

  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-white/10", className)}>
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
