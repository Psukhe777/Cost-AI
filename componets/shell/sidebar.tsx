use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Gauge, Search, Tags } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: Gauge
  },
  {
    href: "/dashboard/explorer",
    label: "Queries",
    icon: Search
  },
  {
    href: "/dashboard/projects",
    label: "Projects",
    icon: Tags
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 border-r border-white/10 bg-white/[0.03] px-3 py-4 backdrop-blur-xl lg:block">
      <div className="mb-7 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight text-zinc-50">Cost AI</div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Telemetry v2
          </div>
        </div>
      </div>

      <nav className="grid gap-1">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-50",
                active && "border border-primary/20 bg-primary/10 text-zinc-50"
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
