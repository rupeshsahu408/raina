import React, { useState } from "react";
import { AppLayout } from "./_shared/AppLayout";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Plus, 
  Building2, 
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Activity
} from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  trustScore: number;
  totalSpend: number;
  invoices: number;
  avgProcessingDays: number;
  status: "New vendor" | "Trusted" | "Flagged" | "Active";
  lastInvoiceDate: string;
  lastInvoiceAmount: number;
  lastInvoiceStatus: string;
  colorClass: string;
}

const mockVendors: Vendor[] = [
  {
    id: "1",
    name: "TechSupply Co.",
    trustScore: 92,
    totalSpend: 174500,
    invoices: 1,
    avgProcessingDays: 3,
    status: "New vendor",
    lastInvoiceDate: "Apr 20, 2026",
    lastInvoiceAmount: 174500,
    lastInvoiceStatus: "Approved",
    colorClass: "bg-indigo-100 text-indigo-700",
  },
  {
    id: "2",
    name: "Infosys Solutions",
    trustScore: 88,
    totalSpend: 89200,
    invoices: 1,
    avgProcessingDays: 4,
    status: "Trusted",
    lastInvoiceDate: "Apr 15, 2026",
    lastInvoiceAmount: 89200,
    lastInvoiceStatus: "Paid",
    colorClass: "bg-blue-100 text-blue-700",
  },
  {
    id: "3",
    name: "Reliance Industries",
    trustScore: 45,
    totalSpend: 320000,
    invoices: 1,
    avgProcessingDays: 12,
    status: "Flagged",
    lastInvoiceDate: "Mar 28, 2026",
    lastInvoiceAmount: 320000,
    lastInvoiceStatus: "Pending Review",
    colorClass: "bg-purple-100 text-purple-700",
  },
  {
    id: "4",
    name: "Tata Consultancy",
    trustScore: 95,
    totalSpend: 560000,
    invoices: 3,
    avgProcessingDays: 2,
    status: "Trusted",
    lastInvoiceDate: "Apr 18, 2026",
    lastInvoiceAmount: 150000,
    lastInvoiceStatus: "Processing",
    colorClass: "bg-sky-100 text-sky-700",
  },
  {
    id: "5",
    name: "Wipro Technologies",
    trustScore: 78,
    totalSpend: 210000,
    invoices: 2,
    avgProcessingDays: 5,
    status: "Active",
    lastInvoiceDate: "Apr 10, 2026",
    lastInvoiceAmount: 95000,
    lastInvoiceStatus: "Paid",
    colorClass: "bg-teal-100 text-teal-700",
  },
  {
    id: "6",
    name: "HCL Technologies",
    trustScore: 82,
    totalSpend: 135000,
    invoices: 1,
    avgProcessingDays: 4,
    status: "Active",
    lastInvoiceDate: "Apr 05, 2026",
    lastInvoiceAmount: 135000,
    lastInvoiceStatus: "Paid",
    colorClass: "bg-cyan-100 text-cyan-700",
  },
  {
    id: "7",
    name: "Mahindra Retail",
    trustScore: 65,
    totalSpend: 45000,
    invoices: 1,
    avgProcessingDays: 8,
    status: "Active",
    lastInvoiceDate: "Mar 12, 2026",
    lastInvoiceAmount: 45000,
    lastInvoiceStatus: "Paid",
    colorClass: "bg-orange-100 text-orange-700",
  },
  {
    id: "8",
    name: "L&T Infrastructure",
    trustScore: 90,
    totalSpend: 850000,
    invoices: 4,
    avgProcessingDays: 3,
    status: "Trusted",
    lastInvoiceDate: "Apr 22, 2026",
    lastInvoiceAmount: 220000,
    lastInvoiceStatus: "Approved",
    colorClass: "bg-rose-100 text-rose-700",
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusBadge = (status: Vendor["status"]) => {
  switch (status) {
    case "New vendor":
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"><Activity className="w-3 h-3" /> New Vendor</span>;
    case "Trusted":
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><ShieldCheck className="w-3 h-3" /> Trusted</span>;
    case "Flagged":
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><ShieldAlert className="w-3 h-3" /> Flagged</span>;
    case "Active":
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800"><Shield className="w-3 h-3" /> Active</span>;
  }
};

const getTrustScoreColor = (score: number) => {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-rose-500";
};

export const Vendors = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVendors = mockVendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout
      pageTitle="Vendors"
      pageSubtitle="Manage your supplier relationships"
      activePage="vendors"
      actions={
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
          <Plus className="w-4 h-4" />
          Add Vendor
        </button>
      }
    >
      <div className="space-y-6">
        
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors w-full sm:w-auto justify-center">
              <Filter className="w-4 h-4 text-slate-400" />
              Filter by Status
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </button>
            <button className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors w-full sm:w-auto justify-center">
              Sort: Total Spend
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </button>
          </div>
        </div>

        {/* Summary Chips */}
        <div className="flex flex-wrap gap-3">
          <div className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white shadow-sm text-sm">
            <span className="text-slate-500 mr-2">Total Vendors:</span>
            <span className="font-semibold text-slate-900">8</span>
          </div>
          <div className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white shadow-sm text-sm">
            <span className="text-slate-500 mr-2">Active This Month:</span>
            <span className="font-semibold text-slate-900">3</span>
          </div>
          <div className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white shadow-sm text-sm">
            <span className="text-slate-500 mr-2">New (30d):</span>
            <span className="font-semibold text-indigo-600">2</span>
          </div>
        </div>

        {/* Vendor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group">
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${vendor.colorClass}`}>
                    {vendor.name.charAt(0)}
                  </div>
                  {getStatusBadge(vendor.status)}
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">{vendor.name}</h3>
                
                <div className="mt-4 mb-5">
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">AI Trust Score</span>
                    <span className="text-sm font-bold text-slate-900">{vendor.trustScore}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${getTrustScoreColor(vendor.trustScore)}`} 
                      style={{ width: `${vendor.trustScore}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-2 py-4 border-t border-slate-100 mt-auto">
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Total Spend</div>
                    <div className="font-semibold text-slate-900">{formatCurrency(vendor.totalSpend)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Invoices</div>
                    <div className="font-medium text-slate-900">{vendor.invoices}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-slate-500 mb-0.5">Avg Processing</div>
                    <div className="font-medium text-slate-900">{vendor.avgProcessingDays} days</div>
                  </div>
                </div>
              </div>
              
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                <div className="text-xs text-slate-500 mb-1">Last Invoice</div>
                <div className="text-sm text-slate-900">
                  {vendor.lastInvoiceDate} &mdash; <span className="font-medium">{formatCurrency(vendor.lastInvoiceAmount)}</span> &middot; {vendor.lastInvoiceStatus}
                </div>
              </div>
              
              <a href={`#vendor-${vendor.id}`} className="px-5 py-3.5 border-t border-slate-100 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 flex items-center justify-between transition-colors">
                View Details
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

      </div>
    </AppLayout>
  );
};
