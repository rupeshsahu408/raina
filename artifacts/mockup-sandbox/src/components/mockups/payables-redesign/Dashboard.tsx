import React, { useState } from "react";
import { AppLayout } from "./_shared/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  UploadCloud, 
  Mail, 
  FileText, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  AlertTriangle,
  Search,
  Filter,
  Download,
  ChevronDown,
  MoreHorizontal,
  ChevronRight,
  ArrowUpRight,
  CheckCircle
} from "lucide-react";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("All");

  const kpis = [
    { title: "Total Invoices", value: "1", subtitle: "All time", icon: FileText, color: "text-slate-600", bg: "bg-slate-100" },
    { title: "Pending Approval", value: "0", subtitle: "Awaiting review", icon: Clock, color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200" },
    { title: "Approved", value: "1", subtitle: "₹1,74,500 total", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200" },
    { title: "Processing", value: "0", subtitle: "In payment queue", icon: RefreshCw, color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" },
    { title: "AI Flagged", value: "0", subtitle: "Needs attention", icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-100", border: "border-rose-200" },
  ];

  const invoices = [
    {
      id: "INV-2026-0847",
      vendor: "TechSupply Co.",
      isNewVendor: false,
      issued: "Apr 20, 2026",
      due: "May 20, 2026",
      amount: "₹1,74,500",
      status: "Approved",
    },
    {
      id: "INV-2026-0831",
      vendor: "Infosys Solutions",
      isNewVendor: true,
      issued: "Apr 15, 2026",
      due: "May 15, 2026",
      amount: "₹89,200",
      status: "Pending",
    },
    {
      id: "INV-2026-0820",
      vendor: "Reliance Industries",
      isNewVendor: false,
      issued: "Apr 10, 2026",
      due: "May 10, 2026",
      amount: "₹3,20,000",
      status: "AI Flagged",
    }
  ];

  const tabs = ["All", "Ready", "Pending", "Approved", "Paid", "Rejected", "Flagged", "Processing"];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved": return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">Approved</Badge>;
      case "Pending": return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">Pending</Badge>;
      case "AI Flagged": return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-medium">AI Flagged</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pageActions = (
    <div className="flex items-center gap-3">
      <Button variant="outline" className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm">
        <Mail className="w-4 h-4 mr-2" />
        Fetch Gmail
      </Button>
      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
        <UploadCloud className="w-4 h-4 mr-2" />
        Upload Invoice
      </Button>
    </div>
  );

  return (
    <AppLayout 
      pageTitle="Dashboard" 
      pageSubtitle="Overview of your accounts payable"
      activePage="dashboard"
      actions={pageActions}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-5 gap-4">
          {kpis.map((kpi, idx) => (
            <Card key={idx} className={`shadow-sm border-slate-200/60 ${kpi.border ? `border-b-2 border-b-${kpi.color.split('-')[1]}-500` : ''}`}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${kpi.bg}`}>
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{kpi.value}</h3>
                  <p className="text-sm font-medium text-slate-700 mt-1">{kpi.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{kpi.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-4">
            <Card className="shadow-sm border-slate-200/60">
              <div className="px-6 py-5 border-b border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">All Invoices</h2>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 rounded-full px-2.5">3</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9 text-slate-600 border-slate-200">
                      <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Search by vendor or invoice number..." 
                      className="pl-9 h-9 border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9 text-slate-600 border-slate-200">
                      Newest first <ChevronDown className="w-4 h-4 ml-2 text-slate-400" />
                    </Button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex overflow-x-auto pb-2 mt-5 gap-1 hide-scrollbar">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                        activeTab === tab 
                          ? "bg-slate-900 text-white" 
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-12 pl-6"><Checkbox className="border-slate-300" /></TableHead>
                      <TableHead className="font-medium text-slate-600">Vendor & Invoice</TableHead>
                      <TableHead className="font-medium text-slate-600">Dates</TableHead>
                      <TableHead className="font-medium text-slate-600 text-right">Amount</TableHead>
                      <TableHead className="font-medium text-slate-600">Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.id} className="hover:bg-slate-50/50 border-b border-slate-100 group transition-colors">
                        <TableCell className="pl-6"><Checkbox className="border-slate-300" /></TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">{inv.vendor}</span>
                              {inv.isNewVendor && (
                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 text-[10px] px-1.5 py-0 rounded uppercase tracking-wider font-bold">New</Badge>
                              )}
                            </div>
                            <span className="text-sm text-slate-500 font-mono mt-0.5">{inv.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="text-slate-900">Issued: {inv.issued}</span>
                            <span className="text-slate-500">Due: {inv.due}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-900">
                          {inv.amount}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(inv.status)}
                        </TableCell>
                        <TableCell className="pr-6">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Stats */}
            <Card className="shadow-sm border-slate-200/60 bg-gradient-to-br from-indigo-900 to-slate-900 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-indigo-200 uppercase tracking-wider">This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-indigo-200 text-sm mb-1">Paid so far</p>
                  <p className="text-2xl font-bold">₹1,74,500</p>
                </div>
                <div className="h-px bg-white/10" />
                <div>
                  <p className="text-indigo-200 text-sm mb-1">Due this week</p>
                  <p className="text-xl font-semibold">₹89,200</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-sm border-slate-200/60">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="space-y-5">
                  
                  <div className="flex gap-3 relative">
                    <div className="absolute top-6 bottom-[-20px] left-3.5 w-px bg-slate-100" />
                    <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 z-10">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-900"><span className="font-medium">TechSupply Co.</span> invoice approved</p>
                      <p className="text-xs text-slate-500 mt-0.5">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex gap-3 relative">
                    <div className="absolute top-6 bottom-[-20px] left-3.5 w-px bg-slate-100" />
                    <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 z-10">
                      <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-900">Gmail sync completed automatically</p>
                      <p className="text-xs text-slate-500 mt-0.5">5 hours ago</p>
                    </div>
                  </div>

                  <div className="flex gap-3 relative">
                    <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 z-10">
                      <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-900">New vendor <span className="font-medium">Infosys Solutions</span> created</p>
                      <p className="text-xs text-slate-500 mt-0.5">1 day ago</p>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </AppLayout>
  );
}
