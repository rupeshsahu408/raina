import React, { useState } from "react";
import { AppLayout } from "./_shared/AppLayout";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Pencil,
  Copy,
  CheckCircle2,
  X,
  DollarSign,
  MessageSquare,
  Send,
  Clock,
  User,
  FileText
} from "lucide-react";

export function InvoiceDetail() {
  const [activeTab, setActiveTab] = useState<"comments" | "audit">("comments");
  const [commentText, setCommentText] = useState("");

  const pageTitleNode = (
    <div className="flex items-center gap-3">
      <button className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-500">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <span className="font-semibold text-slate-900 text-lg">Invoice #INV-2026-0847</span>
    </div>
  );

  return (
    <AppLayout pageTitle={pageTitleNode} activePage="invoices">
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT COLUMN: Invoice Preview (55%) */}
          <div className="w-full lg:w-[55%] flex flex-col gap-4">
            {/* Invoice PDF Simulator */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[800px]">
              <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>INV-2026-0847.pdf</span>
                </div>
                <div className="flex gap-3">
                  <span>1 / 1</span>
                  <span className="font-medium text-slate-700">100%</span>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-8 bg-slate-50 flex justify-center">
                {/* The actual "paper" */}
                <div className="bg-white shadow-md w-full max-w-[700px] min-h-full p-10 font-serif text-slate-800">
                  <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">INVOICE</h1>
                      <p className="text-slate-500 mt-1">#INV-2026-0847</p>
                    </div>
                    <div className="text-right">
                      <h2 className="text-xl font-bold text-slate-900">TechSupply Co.</h2>
                      <p className="text-sm mt-1 text-slate-600">
                        142 Industrial Area Phase 1<br />
                        Bengaluru, Karnataka 560001<br />
                        GSTIN: 29AABCU9603R1ZM
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mb-8">
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</h3>
                      <p className="text-sm font-medium text-slate-900">Plyndrox Technologies Pvt Ltd</p>
                      <p className="text-sm text-slate-600">
                        Level 4, Cyber Park<br />
                        HSR Layout, Bengaluru 560102
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="mb-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Issue Date</h3>
                        <p className="text-sm font-medium">Apr 20, 2026</p>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Due Date</h3>
                        <p className="text-sm font-medium">May 20, 2026</p>
                      </div>
                    </div>
                  </div>

                  <table className="w-full text-sm mb-8">
                    <thead>
                      <tr className="border-b border-slate-300">
                        <th className="py-3 text-left font-bold text-slate-700">Description</th>
                        <th className="py-3 text-center font-bold text-slate-700">Qty</th>
                        <th className="py-3 text-right font-bold text-slate-700">Rate</th>
                        <th className="py-3 text-right font-bold text-slate-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-4 text-slate-800">IT Infrastructure Consulting Services - Q1</td>
                        <td className="py-4 text-center text-slate-600">1</td>
                        <td className="py-4 text-right text-slate-600">₹ 1,50,000</td>
                        <td className="py-4 text-right text-slate-800 font-medium">₹ 1,50,000</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-4 text-slate-800">Server Rack Maintenance</td>
                        <td className="py-4 text-center text-slate-600">2</td>
                        <td className="py-4 text-right text-slate-600">₹ 12,250</td>
                        <td className="py-4 text-right text-slate-800 font-medium">₹ 24,500</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="flex justify-end">
                    <div className="w-1/2">
                      <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="font-medium">₹ 1,74,500</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                        <span className="text-slate-600">IGST (18%)</span>
                        <span className="font-medium">₹ 31,410</span>
                      </div>
                      <div className="flex justify-between py-3 mt-2 border-t-2 border-slate-800">
                        <span className="font-bold text-slate-900">Total Amount</span>
                        <span className="font-bold text-slate-900 text-lg">₹ 2,05,910</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-16 pt-8 border-t border-slate-200">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Information</h3>
                    <p className="text-sm text-slate-600">Bank: HDFC Bank Ltd</p>
                    <p className="text-sm text-slate-600">A/C Name: TechSupply Co.</p>
                    <p className="text-sm text-slate-600">A/C No: 50200012344521</p>
                    <p className="text-sm text-slate-600">IFSC: HDFC0001234</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center justify-between px-2 text-sm">
              <button className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-medium transition-colors">
                <ChevronLeft className="w-4 h-4" /> Previous Invoice
              </button>
              <span className="text-slate-400">4 of 12 Pending Review</span>
              <button className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-medium transition-colors">
                Next Invoice <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Metadata & Actions (45%) */}
          <div className="w-full lg:w-[45%] flex flex-col gap-6">
            
            {/* Status & Metadata Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Ready to Approve
                </span>
                <span className="text-sm text-slate-500">Uploaded 2 hours ago</span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                  <User className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap gap-3">
              <button className="flex-1 min-w-[120px] inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                <CheckCircle2 className="w-4 h-4" /> Approve
              </button>
              <button className="flex-1 min-w-[120px] inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-medium rounded-lg transition-colors shadow-sm">
                <X className="w-4 h-4" /> Reject
              </button>
              <button className="flex-1 min-w-[120px] inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-sm font-medium rounded-lg transition-colors shadow-sm">
                <DollarSign className="w-4 h-4" /> Mark Paid
              </button>
              <button className="flex-1 min-w-[120px] inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-lg transition-colors shadow-sm">
                <MessageSquare className="w-4 h-4" /> Request Info
              </button>
            </div>

            {/* AI Extraction Card */}
            <div className="bg-white border border-indigo-100 rounded-xl shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-indigo-50/30">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <h3 className="font-semibold text-slate-900 text-sm">AI Extracted Data</h3>
                <span className="ml-auto text-xs text-slate-400">High Confidence</span>
              </div>
              <div className="p-5 grid grid-cols-2 gap-y-4 gap-x-6">
                <div className="group flex items-start justify-between cursor-pointer">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Vendor</label>
                    <p className="text-sm text-slate-900 font-medium">TechSupply Co.</p>
                  </div>
                  <Pencil className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
                <div className="group flex items-start justify-between cursor-pointer">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Invoice No</label>
                    <p className="text-sm text-slate-900 font-medium">INV-2026-0847</p>
                  </div>
                  <Pencil className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
                <div className="group flex items-start justify-between cursor-pointer">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Amount</label>
                    <p className="text-sm text-slate-900 font-medium">₹ 2,05,910</p>
                  </div>
                  <Pencil className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
                <div className="group flex items-start justify-between cursor-pointer">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Currency</label>
                    <p className="text-sm text-slate-900 font-medium">INR</p>
                  </div>
                  <Pencil className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
                <div className="group flex items-start justify-between cursor-pointer">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Issue Date</label>
                    <p className="text-sm text-slate-900 font-medium">Apr 20, 2026</p>
                  </div>
                  <Pencil className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
                <div className="group flex items-start justify-between cursor-pointer">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Due Date</label>
                    <p className="text-sm text-slate-900 font-medium">May 20, 2026</p>
                  </div>
                  <Pencil className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
              </div>
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
                <label className="text-xs font-medium text-slate-500 mb-2 block">Line Items (2)</label>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-700 truncate mr-4">IT Infrastructure Consulting Services - Q1 x1</span>
                    <span className="font-medium text-slate-900 shrink-0">₹ 1,50,000</span>
                  </div>
                  <div className="flex justify-between items-center text-sm bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-700 truncate mr-4">Server Rack Maintenance x2</span>
                    <span className="font-medium text-slate-900 shrink-0">₹ 24,500</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 text-sm">Payment Details</h3>
                <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  <Copy className="w-3.5 h-3.5" /> Copy All
                </button>
              </div>
              <div className="p-5 grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Bank</label>
                  <p className="text-sm text-slate-900 font-medium">HDFC Bank Ltd</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Account Number</label>
                  <p className="text-sm text-slate-900 font-medium tracking-wide">••••••4521</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">IFSC Code</label>
                  <p className="text-sm text-slate-900 font-medium uppercase">HDFC0001234</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Vendor Match</label>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Comments & Audit Log Tabs */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
              <div className="flex border-b border-slate-200">
                <button 
                  onClick={() => setActiveTab("comments")}
                  className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "comments" ? "border-indigo-600 text-indigo-600 bg-indigo-50/30" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
                >
                  Comments (1)
                </button>
                <button 
                  onClick={() => setActiveTab("audit")}
                  className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "audit" ? "border-indigo-600 text-indigo-600 bg-indigo-50/30" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
                >
                  Audit Log
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col min-h-[250px]">
                {activeTab === "comments" ? (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 flex flex-col gap-4 mb-4">
                      {/* Sample Comment */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-slate-600">SM</span>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 flex-1 border border-slate-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-900">Sarah Manager</span>
                            <span className="text-xs text-slate-400">10:45 AM</span>
                          </div>
                          <p className="text-sm text-slate-700">Vendor updated the GSTIN. Proceeding to approve this invoice.</p>
                        </div>
                      </div>
                    </div>
                    {/* Input */}
                    <div className="relative mt-auto">
                      <input 
                        type="text" 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment or note..." 
                        className="w-full pl-4 pr-12 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {/* Timeline Item */}
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 z-10">
                          <Sparkles className="w-3 h-3" />
                        </div>
                        <div className="w-px h-full bg-slate-200 my-1"></div>
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium text-slate-900">AI Extraction Complete</p>
                        <p className="text-xs text-slate-500 mt-0.5">High confidence match for all required fields.</p>
                        <span className="text-xs text-slate-400 mt-1 inline-block text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3"/> Today, 09:30 AM</span>
                      </div>
                    </div>
                    
                    {/* Timeline Item */}
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 z-10">
                          <FileText className="w-3 h-3" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Invoice Uploaded</p>
                        <p className="text-xs text-slate-500 mt-0.5">Received via vendor email drop (vendors@plyndrox.com)</p>
                        <span className="text-xs text-slate-400 mt-1 inline-block text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3"/> Today, 09:28 AM</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
