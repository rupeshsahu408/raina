import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { ChevronRight, Edit2, CheckCircle2, AlertTriangle, FileText, ArrowLeft, Search, Filter, Save, X } from "lucide-react";

type LedgerEntry = {
  id: string;
  commodity: string;
  rate: number;
  quantity: number;
  amount: number;
  status: 'verified' | 'needs_review';
  sourceText?: string;
  notes?: string;
};

const MOCK_ENTRIES: LedgerEntry[] = [
  { id: '1', commodity: 'गेहूं', rate: 2400, quantity: 50, amount: 120000, status: 'verified', sourceText: 'गेहूं 50 qtl @ 2400' },
  { id: '2', commodity: 'सरसों', rate: 5200, quantity: 20, amount: 104000, status: 'needs_review', sourceText: 'सरसों 20 बोरी 5200' },
  { id: '3', commodity: 'चना', rate: 5800, quantity: 15, amount: 87000, status: 'verified', sourceText: 'चना 15 @ 5800' },
  { id: '4', commodity: 'मूंग', rate: 7200, quantity: 10, amount: 72000, status: 'verified', sourceText: 'मूंग 10 qtl 7200' },
  { id: '5', commodity: 'बाजरा', rate: 2100, quantity: 40, amount: 84000, status: 'needs_review', sourceText: 'बाजरा 40 @ 2100?' },
];

export function MobileEditWireframe() {
  const [entries, setEntries] = useState<LedgerEntry[]>(MOCK_ENTRIES);
  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null);

  const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);

  const handleEdit = (entry: LedgerEntry) => {
    setEditingEntry({ ...entry });
  };

  const handleSave = () => {
    if (!editingEntry) return;
    setEntries(entries.map(e => e.id === editingEntry.id ? { ...editingEntry, status: 'verified' } : e));
    setEditingEntry(null);
  };

  return (
    <div className="min-h-[100dvh] bg-background max-w-md mx-auto relative shadow-xl overflow-hidden flex flex-col font-sans">
      
      {/* App Header */}
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/90 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-lg leading-tight">रामलाल ट्रेडिंग कं.</h1>
            <p className="text-xs text-primary-foreground/80 font-medium">१२ अक्टूबर २०२३</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/90">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Summary Summary */}
      <div className="bg-white p-4 border-b border-border shadow-sm z-10">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-muted-foreground">कुल रकम (५ एंट्री)</span>
          <span className="text-2xl font-bold text-foreground">₹ {totalAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-none font-medium rounded-sm">
            २ समीक्षा बाकी
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-none font-medium rounded-sm">
            ३ सत्यापित
          </Badge>
        </div>
      </div>

      {/* Ledger List */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {entries.map((entry) => (
          <Card 
            key={entry.id} 
            className={`border transition-colors ${entry.status === 'needs_review' ? 'border-orange-200 bg-orange-50/30' : 'border-border bg-card'}`}
          >
            <CardContent className="p-0">
              <div className="p-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base text-foreground">{entry.commodity}</h3>
                    {entry.status === 'needs_review' ? (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-x-4 gap-y-1 text-sm text-muted-foreground flex-wrap">
                    <span>दर: <span className="font-medium text-foreground">₹{entry.rate}</span></span>
                    <span>वजन: <span className="font-medium text-foreground">{entry.quantity} qtl</span></span>
                  </div>
                  {entry.status === 'needs_review' && (
                    <p className="text-xs text-orange-700 mt-2 bg-orange-100/50 p-1.5 rounded inline-block">
                      कृपया दर और वजन की जांच करें
                    </p>
                  )}
                </div>
                <div className="text-right ml-2 flex flex-col items-end justify-between h-full min-h-[60px]">
                  <span className="font-bold text-foreground">₹{(entry.rate * entry.quantity).toLocaleString('en-IN')}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 mt-auto rounded-full bg-white shadow-sm border-gray-200 text-primary hover:text-primary hover:bg-green-50"
                    onClick={() => handleEdit(entry)}
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                    सुधारें
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </main>

      {/* Floating Action */}
      <div className="absolute bottom-6 right-6">
        <Button size="lg" className="rounded-full h-14 px-6 shadow-lg text-md font-medium">
          <CheckCircle2 className="mr-2 h-5 w-5" />
          खाता पक्का करें
        </Button>
      </div>

      {/* Edit Bottom Sheet Modal */}
      <Sheet open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl px-0 pb-0 pt-4 h-[85vh] flex flex-col max-w-md mx-auto sm:max-w-md">
          <div className="px-6 pb-2">
            <SheetHeader className="text-left flex flex-row items-center justify-between space-y-0">
              <div>
                <SheetTitle className="text-xl font-bold">एंट्री सुधारें</SheetTitle>
                <SheetDescription className="text-xs mt-1">
                  मूल पर्ची: <span className="font-medium text-foreground bg-muted px-1 py-0.5 rounded">"{editingEntry?.sourceText}"</span>
                </SheetDescription>
              </div>
              <Button variant="ghost" size="icon" className="-mr-2" onClick={() => setEditingEntry(null)}>
                <X className="h-5 w-5" />
              </Button>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {editingEntry && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="commodity" className="text-muted-foreground font-medium">फसल का नाम</Label>
                  <Input 
                    id="commodity" 
                    value={editingEntry.commodity} 
                    onChange={(e) => setEditingEntry({...editingEntry, commodity: e.target.value})}
                    className="h-12 text-lg font-medium bg-white" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rate" className="text-muted-foreground font-medium">दर (प्रति क्विंटल)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                      <Input 
                        id="rate" 
                        type="number"
                        value={editingEntry.rate} 
                        onChange={(e) => setEditingEntry({...editingEntry, rate: Number(e.target.value)})}
                        className="h-12 text-lg font-medium pl-7 bg-white" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-muted-foreground font-medium">वजन (क्विंटल)</Label>
                    <div className="relative">
                      <Input 
                        id="quantity" 
                        type="number"
                        value={editingEntry.quantity} 
                        onChange={(e) => setEditingEntry({...editingEntry, quantity: Number(e.target.value)})}
                        className="h-12 text-lg font-medium pr-10 bg-white" 
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">qtl</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex justify-between items-center">
                  <span className="text-primary font-medium">कुल रकम</span>
                  <span className="text-2xl font-bold text-primary">₹{(editingEntry.rate * editingEntry.quantity).toLocaleString('en-IN')}</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-muted-foreground font-medium">टिप्पणी (वैकल्पिक)</Label>
                  <Input 
                    id="notes" 
                    placeholder="कोई अतिरिक्त जानकारी..."
                    value={editingEntry.notes || ''} 
                    onChange={(e) => setEditingEntry({...editingEntry, notes: e.target.value})}
                    className="h-12 bg-white" 
                  />
                </div>
              </>
            )}
          </div>

          <div className="p-4 bg-white border-t flex gap-3 pb-8">
            <Button 
              variant="outline" 
              className="flex-1 h-14 rounded-xl text-base font-medium"
              onClick={() => setEditingEntry(null)}
            >
              रद्द करें
            </Button>
            <Button 
              className="flex-1 h-14 rounded-xl text-base font-medium bg-primary hover:bg-primary/90"
              onClick={handleSave}
            >
              <Save className="mr-2 h-5 w-5" />
              सेव करें
            </Button>
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
}
