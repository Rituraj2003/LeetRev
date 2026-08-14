import { Link, useLocation } from "react-router-dom";

const navItems = [
  {
    to: "/",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: "/reviews",
    label: "Revision",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
  },
  {
    to: "/setup",
    label: "Repository",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-52 bg-white border-r border-[#E8E4DA] flex flex-col">

      {/* logo */}
      <div className="px-6 py-7 border-b border-[#E8E4DA]">
        <p className="font-serif text-lg text-[#1C1B19] leading-none">LeetRev</p>
        <p className="text-[11px] text-[#8A8578] mt-1">revision assistant</p>
      </div>

      {/* nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-[#F3F1EB] text-[#1C1B19] font-medium"
                  : "text-[#6B6659] hover:bg-[#FAF9F6] hover:text-[#1C1B19]"
              }`}
            >
              <span className={active ? "text-[#2B3A55]" : "text-[#8A8578]"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* footer */}
      <div className="px-6 py-5 border-t border-[#E8E4DA]">
        <p className="text-[11px] text-[#8A8578]">synced from GitHub</p>
      </div>

    </aside>
  );
}
