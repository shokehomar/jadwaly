"use client";

// Left nav: logo + links from NAV_ITEMS; highlights active route.
// On phones it becomes a bottom tab bar.
// Imports: @/constants (NAV_ITEMS), next/link, next/navigation (usePathname)

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/constants";
import { useData } from "@/components/providers/DataProvider";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useData();

  const items = NAV_ITEMS.filter((item) => profile.diploma || !item.diplomaOnly);
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Desktop and tablet */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="sticky top-0 flex h-screen flex-col gap-8 px-4 py-6">
          <Link href="/dashboard" className="px-3 text-xl font-bold text-primary">
            jadwaly
          </Link>
          <nav className="flex flex-col gap-1">
            {items.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(href)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-surface"
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
          {/* Temporary, for testing onboarding */}
          <Link
            href="/onboarding"
            className="mt-auto px-3 text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            Redo onboarding
          </Link>
        </div>
      </aside>

      {/* Phones */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-sidebar-border bg-sidebar pb-[env(safe-area-inset-bottom)] md:hidden">
        {items.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium",
              isActive(href) ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
