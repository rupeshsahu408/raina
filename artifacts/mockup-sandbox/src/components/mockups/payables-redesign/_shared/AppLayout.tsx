import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
  pageTitle: string;
  pageSubtitle?: string;
  actions?: ReactNode;
  activePage?: string;
}

export function AppLayout({ children, pageTitle, pageSubtitle, actions, activePage }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-[#F8F9FC] font-['Inter'] overflow-hidden">
      <Sidebar activePage={activePage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6">
          <div>
            <h1 className="text-[17px] font-semibold text-[#111827]">{pageTitle}</h1>
            {pageSubtitle && (
              <p className="text-[12px] text-[#6B7280] mt-0.5">{pageSubtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-[#E5E7EB]">
              <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center text-white text-[13px] font-semibold">S</div>
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-medium text-[#111827]">Semi</p>
                <p className="text-[11px] text-[#6B7280]">Admin</p>
              </div>
            </div>
          </div>
        </header>
        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
