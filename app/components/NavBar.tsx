"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/items", label: "Items" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/trips", label: "Trips" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="app-header">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="app-header__mark text-lg">Inventory Ops</span>
        <nav className="app-nav flex items-center gap-6">
          {links.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
