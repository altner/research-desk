"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useProject } from "@/lib/project-context";

const NAV = [
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
    <aside
      style={{ width: 72, background: "#17263A", flexShrink: 0 }}
      className="flex flex-col items-center py-0 h-full relative"
    >
      {/* Nav items */}
      <nav className="flex flex-col gap-3 w-full px-2 flex-1" style={{ paddingTop: 12 }}>
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
