"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useProject } from "@/lib/project-context";

const NAV = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M7 18v-6h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/sources",
    label: "Sources",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2 4h16M2 8h10M2 12h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M13 14l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 17v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/ideas",
    label: "Ideas",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="6" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
        <rect x="12" y="2" width="6" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
        <rect x="2" y="13" width="6" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
        <rect x="12" y="10" width="6" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      </svg>
    ),
  },
  {
    href: "/articles",
    label: "Articles",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { projectName, clearProject } = useProject();

  const handleSwitchProject = () => {
    clearProject();
    router.push("/");
  };

  return (
    <aside className="w-[72px] bg-sidebar shrink-0 flex flex-col items-center h-full relative">
      <nav className="flex flex-col gap-3 w-full px-2 pt-5 flex-1">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={[
                "flex flex-col items-center gap-1 py-2 rounded-lg transition-colors",
                active
                  ? "text-action bg-action/10"
                  : "text-white/50 bg-transparent hover:text-white/75",
              ].join(" ")}
            >
              {item.icon}
              <span className="text-[9px] tracking-[0.04em] font-medium uppercase">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
