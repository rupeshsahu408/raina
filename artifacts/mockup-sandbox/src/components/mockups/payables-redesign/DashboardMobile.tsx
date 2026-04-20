import React from 'react';
import { 
  Menu, 
  Bell, 
  Upload, 
  Mail, 
  BarChart3, 
  Users, 
  Search, 
  ChevronRight, 
  Home, 
  FileText, 
  Settings,
  CircleAlert,
  CheckCircle2,
  Clock
} from 'lucide-react';

export function DashboardMobile() {
  return (
    <div className="min-h-screen bg-gray-50 font-['Inter'] max-w-[390px] mx-auto relative pb-20 shadow-xl overflow-hidden border-x border-gray-200">
      {/* 1. Mobile Top Bar (Sticky) */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-indigo-600 tracking-tight">Payables AI</h1>
        <div className="flex items-center gap-3">
          <button className="relative text-gray-500 hover:text-gray-800 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm border border-indigo-200">
            S
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* 2. Workspace Badge Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">semi's workspace</span>
          </div>
          <div className="px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-md">
            Free plan
          </div>
        </div>

        {/* 3. KPI Stat Cards (Horizontal Scroll) */}
        <div className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar">
          <div className="min-w-[280px] snap-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">1</p>
              </div>
              <div className="p-2 bg-indigo-50 rounded-lg">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Approved</span>
              <span className="text-sm font-bold text-emerald-600">₹1,74,500</span>
            </div>
          </div>

          <div className="min-w-[280px] snap-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">AI Flagged</span>
              <span className="text-sm font-bold text-red-600">0</span>
            </div>
          </div>
        </div>

        {/* 4. Quick Actions */}
        <div className="grid grid-cols-4 gap-2">
          <button className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-active:scale-95 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-gray-600 text-center leading-tight">Upload<br/>Invoice</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-active:scale-95 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-gray-600 text-center leading-tight">Fetch<br/>Gmail</span>
          </button>

          <button className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-active:scale-95 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-gray-600 text-center leading-tight">Analytics</span>
          </button>

          <button className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center group-active:scale-95 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-gray-600 text-center leading-tight">Vendors</span>
          </button>
        </div>

        {/* 5. Invoice List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Recent Invoices</h2>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-3">
            {/* Invoice 1 */}
            <button className="w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 hover:shadow-md transition-all text-left">
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900 truncate">TechSupply Co.</span>
                  <span className="text-sm font-bold text-gray-900 ml-2">₹1,74,500</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 truncate">#INV-2026-0847 • Apr 20</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3" />
                    Approved
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
            </button>

            {/* Invoice 2 */}
            <button className="w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 hover:shadow-md transition-all text-left">
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900 truncate">Infosys Solutions</span>
                  <span className="text-sm font-bold text-gray-900 ml-2">₹89,200</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 truncate">#INV-2026-0831 • Apr 15</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
            </button>

            {/* Invoice 3 */}
            <button className="w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 hover:shadow-md transition-all text-left">
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900 truncate">Reliance</span>
                  <span className="text-sm font-bold text-gray-900 ml-2">₹3,20,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 truncate">#INV-2026-0820 • Apr 10</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-100">
                    <CircleAlert className="w-3 h-3" />
                    Flagged
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
            </button>
          </div>
        </div>
      </main>

      {/* 6. Bottom Navigation Bar (Fixed) */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-gray-200 px-6 py-2 pb-6 z-30">
        <div className="flex justify-between items-center">
          <button className="flex flex-col items-center gap-1 min-w-[56px]">
            <div className="relative">
              <Home className="w-6 h-6 text-indigo-600" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></div>
            </div>
            <span className="text-[10px] font-medium text-indigo-600">Home</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 min-w-[56px] text-gray-400 hover:text-gray-900 transition-colors">
            <FileText className="w-6 h-6" />
            <span className="text-[10px] font-medium">Invoices</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 min-w-[56px] text-gray-400 hover:text-gray-900 transition-colors">
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-medium">Vendors</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 min-w-[56px] text-gray-400 hover:text-gray-900 transition-colors">
            <BarChart3 className="w-6 h-6" />
            <span className="text-[10px] font-medium">Analytics</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 min-w-[56px] text-gray-400 hover:text-gray-900 transition-colors">
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </nav>

      {/* Custom Styles for hiding scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
