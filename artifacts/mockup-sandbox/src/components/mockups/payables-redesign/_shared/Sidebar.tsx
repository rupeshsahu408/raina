interface SidebarProps {
  activePage?: string;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: DashboardIcon },
  { id: "invoices", label: "Invoices", icon: InvoiceIcon },
  { id: "vendors", label: "Vendors", icon: VendorsIcon },
  { id: "analytics", label: "Analytics", icon: AnalyticsIcon },
  { id: "rules", label: "Rules", icon: RulesIcon },
  { id: "team", label: "Team", icon: TeamIcon },
];

const bottomItems = [
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export function Sidebar({ activePage }: SidebarProps) {
  return (
    <aside className="w-56 flex-shrink-0 bg-[#111827] flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#6366F1] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 4L7 2L12 4V10L7 12L2 10V4Z" fill="white" fillOpacity="0.9"/>
              <path d="M7 2V12M2 4L12 10M12 4L2 10" stroke="white" strokeWidth="0.8" strokeOpacity="0.5"/>
            </svg>
          </div>
          <div>
            <span className="text-white font-semibold text-[14px] tracking-tight">Plyndrox</span>
            <span className="block text-[10px] text-white/40 -mt-0.5">Payables AI</span>
          </div>
        </div>
      </div>

      {/* Workspace badge */}
      <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-lg bg-white/5 flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-[#6366F1]/30 flex items-center justify-center flex-shrink-0">
          <span className="text-[#A5B4FC] text-[10px] font-bold">S</span>
        </div>
        <div className="min-w-0">
          <p className="text-white text-[12px] font-medium truncate">semi's workspace</p>
          <p className="text-white/40 text-[10px]">Free plan</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-white/30 uppercase tracking-widest">Main</p>
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activePage === id;
          return (
            <div
              key={id}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                active
                  ? "bg-[#6366F1] text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon active={active} />
              <span className="text-[13px] font-medium">{label}</span>
              {id === "invoices" && (
                <span className="ml-auto text-[10px] font-semibold bg-[#EF4444] text-white rounded-full px-1.5 py-0.5">3</span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-white/10 space-y-0.5">
        {bottomItems.map(({ id, label, icon: Icon }) => {
          const active = activePage === id;
          return (
            <div
              key={id}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                active
                  ? "bg-[#6366F1] text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon active={active} />
              <span className="text-[13px] font-medium">{label}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-3 px-3 py-2 mt-1">
          <div className="w-7 h-7 rounded-full bg-[#6366F1] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[11px] font-semibold">S</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-[12px] font-medium truncate">Semi</p>
            <p className="text-white/40 text-[10px]">support@study...</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function DashboardIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill={active ? "white" : "currentColor"} fillOpacity={active ? 1 : 0.8}/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill={active ? "white" : "currentColor"} fillOpacity={active ? 1 : 0.8}/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill={active ? "white" : "currentColor"} fillOpacity={active ? 0.6 : 0.5}/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill={active ? "white" : "currentColor"} fillOpacity={active ? 0.6 : 0.5}/>
    </svg>
  );
}

function InvoiceIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 1H10L14 5V14C14 14.55 13.55 15 13 15H4C3.45 15 3 14.55 3 14V2C3 1.45 3.45 1 4 1Z" stroke="currentColor" strokeWidth="1.3" fill="none" opacity={active ? 1 : 0.8}/>
      <path d="M10 1V5H14" stroke="currentColor" strokeWidth="1.3" opacity={active ? 0.6 : 0.5}/>
      <path d="M6 8H11M6 10.5H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity={active ? 0.8 : 0.6}/>
    </svg>
  );
}

function VendorsIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" opacity={active ? 1 : 0.8}/>
      <path d="M1 14C1 11.24 3.24 9 6 9C8.76 9 11 11.24 11 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity={active ? 1 : 0.8}/>
      <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" opacity={active ? 0.6 : 0.5}/>
      <path d="M11.5 9C13.5 9 15 10.5 15 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity={active ? 0.6 : 0.5}/>
    </svg>
  );
}

function AnalyticsIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 13L6 8L9 11L13 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity={active ? 1 : 0.8}/>
      <circle cx="13" cy="5" r="1.5" fill="currentColor" opacity={active ? 0.7 : 0.5}/>
    </svg>
  );
}

function RulesIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 4H13M3 8H10M3 12H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity={active ? 1 : 0.8}/>
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.3" opacity={active ? 0.7 : 0.5}/>
      <path d="M13.8 11.8L15 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity={active ? 0.7 : 0.5}/>
    </svg>
  );
}

function TeamIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" opacity={active ? 1 : 0.8}/>
      <path d="M3 14C3 11.24 5.24 9 8 9C10.76 9 13 11.24 13 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity={active ? 1 : 0.8}/>
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" opacity={active ? 1 : 0.8}/>
      <path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.22 3.22L4.28 4.28M11.72 11.72L12.78 12.78M12.78 3.22L11.72 4.28M4.28 11.72L3.22 12.78" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity={active ? 0.7 : 0.5}/>
    </svg>
  );
}
