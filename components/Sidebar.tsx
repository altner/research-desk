"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    href: "/inbox",
    label: "Inbox",
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
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.6"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{ width: 72, background: "#17263A", flexShrink: 0 }}
      className="flex flex-col items-center py-0 h-full relative"
    >
      {/* Top amber stripe */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#C8892E" }} />

      {/* Logo */}
      <div className="mt-5 mb-6 flex items-center justify-center"
        style={{ width: 40, height: 40, background: "#C8892E", borderRadius: 9, flexShrink: 0 }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 3l1.5 5h5l-4 3 1.5 5L11 13l-4 3 1.5-5-4-3h5z" fill="white"/>
        </svg>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 w-full px-2 flex-1">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className="flex flex-col items-center gap-1 py-2 rounded-lg transition-colors"
              style={{
                color: active ? "#C8892E" : "rgba(255,255,255,0.5)",
                background: active ? "rgba(200,137,46,0.12)" : "transparent",
              }}
            >
              {item.icon}
              <span style={{ fontSize: 9, letterSpacing: "0.04em", fontWeight: 500, textTransform: "uppercase" }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
