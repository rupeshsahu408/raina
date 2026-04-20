import React, { useState } from "react";
import { AppLayout } from "./_shared/AppLayout";
import { 
  Building2, 
  Mail, 
  Users, 
  Bell, 
  CreditCard, 
  Globe, 
  Palette, 
  UploadCloud, 
  CheckCircle2, 
  RefreshCw, 
  Unlink, 
  Link as LinkIcon, 
  Copy, 
  ExternalLink,
  ChevronDown
} from "lucide-react";

export function Settings() {
  const [activeTab, setActiveTab] = useState("workspace");

  const tabs = [
    { id: "workspace", label: "Workspace", icon: Building2 },
    { id: "gmail", label: "Gmail Integration", icon: Mail },
    { id: "supplier", label: "Supplier Portal", icon: Globe },
    { id: "templates", label: "Email Templates", icon: Palette },
    { id: "currency", label: "Currency & Region", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "team", label: "Team & Roles", icon: Users },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  return (
    <AppLayout pageTitle="Settings" activePage="settings">
      <div className="flex h-full flex-col md:flex-row gap-8 max-w-6xl mx-auto w-full pb-12">
        {/* Left Sidebar (Tabs) */}
        <div className="w-full md:w-56 flex-shrink-0">
          <nav className="flex flex-col space-y-1 sticky top-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-indigo-50 text-indigo-700" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          <div className="space-y-8">
            
            {/* WORKSPACE TAB CONTENT */}
            <div className={activeTab === "workspace" ? "block" : "hidden"}>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Workspace Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your company identity and core preferences.</p>
              </div>

              <div className="mt-6 space-y-8">
                {/* Company Identity */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Company Identity</h3>
                  
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input 
                        type="text" 
                        id="company-name" 
                        defaultValue="Semi Technologies"
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                           <Building2 className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="flex-1 max-w-md border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                          <UploadCloud className="mx-auto h-6 w-6 text-gray-400" />
                          <p className="mt-1 text-sm font-medium text-indigo-600">Upload your company logo</p>
                          <p className="text-xs text-gray-500 mt-0.5">PNG, JPG up to 2MB</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brand Color</label>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 ring-2 ring-offset-2 ring-indigo-500"></div>
                        <span className="text-sm text-gray-600 font-mono">#6366F1</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Currency & Region Preferences */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Localization</h3>
                  
                  <div className="max-w-md">
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                    <div className="relative">
                      <select 
                        id="currency" 
                        className="appearance-none w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
                        defaultValue="inr"
                      >
                        <option value="inr">INR — Indian Rupee ₹</option>
                        <option value="usd">USD — US Dollar $</option>
                        <option value="eur">EUR — Euro €</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">This currency will be used as the default for new invoices and reports.</p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>

            {/* GMAIL INTEGRATION TAB CONTENT */}
            <div className={activeTab === "gmail" ? "block" : "hidden"}>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Gmail Integration</h2>
                <p className="text-sm text-gray-500 mt-1">Automatically import vendor invoices from your inbox.</p>
              </div>

              <div className="mt-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-medium text-gray-900">Google Workspace</h3>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              Connected
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">support.studyhelp@gmail.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                          <RefreshCw className="w-4 h-4 text-gray-500" />
                          Fetch Now
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                          <Unlink className="w-4 h-4" />
                          Disconnect
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gray-50 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Auto-sync Invoices</h4>
                      <p className="text-sm text-gray-500 mt-1">Auto-import invoice emails from your inbox.</p>
                      <p className="text-xs text-gray-400 mt-2">Last synced: Today at 4:30 PM</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* SUPPLIER PORTAL TAB CONTENT */}
            <div className={activeTab === "supplier" ? "block" : "hidden"}>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Supplier Portal</h2>
                <p className="text-sm text-gray-500 mt-1">Provide a dedicated portal for vendors to upload invoices.</p>
              </div>

              <div className="mt-6 space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-base font-medium text-gray-900 mb-2">Your Supplier Upload Link</h3>
                  <p className="text-sm text-gray-500 mb-5">Share this permanent branded link with vendors. Their invoices appear here automatically.</p>
                  
                  <div className="flex items-center max-w-2xl gap-3">
                    <div className="flex-1 flex items-center bg-gray-50 border border-gray-300 rounded-md px-3 py-2">
                      <LinkIcon className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600 truncate">https://www.plyndrox.app/payables/supplier/semi-tech-v9k2m</span>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">
                      <Copy className="w-4 h-4 text-gray-500" />
                      Copy Link
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Branded portal preview</h3>
                      <p className="text-sm text-gray-500 mt-1">Show your logo and brand colors on the upload portal.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* PLACEHOLDER FOR OTHER TABS */}
            {["templates", "currency", "notifications", "team", "billing"].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Building2, { className: "w-8 h-8 text-gray-400" })}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  This section is currently under development. Settings for {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} will appear here.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
