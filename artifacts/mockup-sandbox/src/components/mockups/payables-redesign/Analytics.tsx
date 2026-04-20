import React, { useState } from "react";
import { AppLayout } from "./_shared/AppLayout";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  CreditCard, 
  Wallet, 
  CheckCircle2,
  Calendar,
  Download,
  Filter,
  ChevronDown,
  ArrowUpDown
} from "lucide-react";

export function Analytics() {
  const [dateRange, setDateRange] = useState("30 days");

  const tabs = ["7 days", "30 days", "90 days", "This year"];

  const kpis = [
    {
      title: "Total Spend",
      value: "₹2,63,700",
      trend: "↑ 12% vs last month",
      trendUp: true,
      icon: <Wallet className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      title: "Invoices Processed",
      value: "3",
      trend: "↑ 1 vs last month",
      trendUp: true,
      icon: <CreditCard className="w-5 h-5 text-indigo-600" />,
      bg: "bg-indigo-50",
      border: "border-indigo-100"
    },
    {
      title: "Avg Invoice Value",
      value: "₹87,900",
      trend: "↑ 4% vs last month",
      trendUp: true,
      icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
      bg: "bg-purple-50",
      border: "border-purple-100"
    },
    {
      title: "Overdue Amount",
      value: "₹0",
      trend: "All clear",
      trendUp: null,
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      bg: "bg-green-50",
      border: "border-green-100"
    }
  ];

  const vendors = [
    { name: "Reliance Retail Ltd", invoices: 12, total: "₹1,45,000", avg: "₹12,083", last: "12 Apr 2024", status: "Approved" },
    { name: "Tata Consultancy Services", invoices: 2, total: "₹85,000", avg: "₹42,500", last: "08 Apr 2024", status: "Paid" },
    { name: "Infosys Technologies", invoices: 4, total: "₹42,500", avg: "₹10,625", last: "01 Apr 2024", status: "Pending" },
    { name: "Wipro Limited", invoices: 1, total: "₹18,200", avg: "₹18,200", last: "28 Mar 2024", status: "Paid" },
    { name: "HDFC Bank (Corporate)", invoices: 1, total: "₹12,500", avg: "₹12,500", last: "15 Mar 2024", status: "Paid" },
  ];

  return (
    <AppLayout 
      pageTitle="Analytics" 
      pageSubtitle="Spend intelligence & trends" 
      activePage="analytics"
      actions={
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        
        {/* Date Range Tabs */}
        <div className="flex items-center justify-between">
          <div className="inline-flex bg-gray-100/80 p-1 rounded-xl border border-gray-200/50">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setDateRange(tab)}
                className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  dateRange === tab 
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Calendar className="w-4 h-4" />
            <span>Apr 1 - Apr 30, 2024</span>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, i) => (
            <div key={i} className={`bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.border} border`}>
                  {kpi.icon}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{kpi.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
              </div>
              <div className="mt-4 flex items-center gap-1.5">
                {kpi.trendUp === true && <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
                {kpi.trendUp === false && <ArrowDownRight className="w-4 h-4 text-rose-500" />}
                {kpi.trendUp === null && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                <span className={`text-sm font-medium ${
                  kpi.trendUp === true ? "text-emerald-600" : 
                  kpi.trendUp === false ? "text-rose-600" : 
                  "text-emerald-600"
                }`}>
                  {kpi.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Monthly Spend Trend */}
          <div className="w-full lg:w-[60%] bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Monthly Spend Trend</h3>
                <p className="text-sm text-gray-500">6-month historical view</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-[240px] w-full relative flex items-end pt-4">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-400 font-medium pb-2">
                <span>3L</span>
                <span>2L</span>
                <span>1L</span>
                <span>0</span>
              </div>
              
              {/* Chart Area */}
              <div className="ml-14 w-full h-full relative border-b border-gray-100 flex items-end justify-between pb-8">
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pb-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-full h-px bg-gray-100/50"></div>
                  ))}
                </div>
                
                {/* SVG Area Chart */}
                <div className="absolute inset-0 pb-8 overflow-hidden">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 200">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M0,160 C50,160 80,120 120,120 C160,120 180,80 240,80 C300,80 320,100 360,100 C400,100 440,60 480,60 C520,60 560,20 600,20 L600,200 L0,200 Z" 
                      fill="url(#chartGradient)" 
                    />
                    <path 
                      d="M0,160 C50,160 80,120 120,120 C160,120 180,80 240,80 C300,80 320,100 360,100 C400,100 440,60 480,60 C520,60 560,20 600,20" 
                      fill="none" 
                      stroke="#4f46e5" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                    />
                    
                    {/* Data Points */}
                    <circle cx="0" cy="160" r="4" fill="#fff" stroke="#4f46e5" strokeWidth="2" />
                    <circle cx="120" cy="120" r="4" fill="#fff" stroke="#4f46e5" strokeWidth="2" />
                    <circle cx="240" cy="80" r="4" fill="#fff" stroke="#4f46e5" strokeWidth="2" />
                    <circle cx="360" cy="100" r="4" fill="#fff" stroke="#4f46e5" strokeWidth="2" />
                    <circle cx="480" cy="60" r="4" fill="#fff" stroke="#4f46e5" strokeWidth="2" />
                    <circle cx="600" cy="20" r="6" fill="#4f46e5" stroke="#fff" strokeWidth="2" />
                  </svg>
                </div>
                
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-500 font-medium">
                  <span className="translate-x-[-50%]">Nov</span>
                  <span className="translate-x-[-50%]">Dec</span>
                  <span className="translate-x-[-50%]">Jan</span>
                  <span className="translate-x-[-50%]">Feb</span>
                  <span className="translate-x-[-50%]">Mar</span>
                  <span className="translate-x-[-50%]">Apr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Spend by Status */}
          <div className="w-full lg:w-[40%] bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Spend by Status</h3>
                <p className="text-sm text-gray-500">Distribution this period</p>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Donut Chart */}
              <div className="relative w-48 h-48 mb-8">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="16" />
                  {/* Approved (65%) */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#4f46e5" strokeWidth="16" strokeDasharray="163.36 251.2" strokeDashoffset="0" />
                  {/* Paid (20%) */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="16" strokeDasharray="50.24 251.2" strokeDashoffset="-163.36" />
                  {/* Pending (10%) */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="16" strokeDasharray="25.12 251.2" strokeDashoffset="-213.6" />
                  {/* Flagged (5%) */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="16" strokeDasharray="12.56 251.2" strokeDashoffset="-238.72" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">100%</span>
                  <span className="text-xs text-gray-500 font-medium">Allocated</span>
                </div>
              </div>
              
              {/* Legend */}
              <div className="w-full grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                    <span className="text-sm text-gray-600">Approved</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">65%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-gray-600">Paid</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">20%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm text-gray-600">Pending</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">10%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-gray-600">Flagged</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">5%</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Top Vendors Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Top Vendors by Spend</h3>
              <p className="text-sm text-gray-500">Based on processed invoices</p>
            </div>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              View All Vendors
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                      Invoices <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                      Total Spend <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Avg Value
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Last Invoice
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendors.map((vendor, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {vendor.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{vendor.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{vendor.invoices}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-900">{vendor.total}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{vendor.avg}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">{vendor.last}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        vendor.status === 'Approved' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        vendor.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
