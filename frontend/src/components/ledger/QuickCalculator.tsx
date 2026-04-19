"use client";

import { useState } from "react";

function CalculatorIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/></svg>;
}

function DeleteIcon(p: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z"/><path d="m18 9-6 6"/><path d="m12 9 6 6"/></svg>;
}

export default function QuickCalculator({ compact = false }: { compact?: boolean }) {
  const [display, setDisplay] = useState("0");
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const normalizedDisplay = Number(display.replace(/,/g, ""));

  const formatDisplay = (value: number) => {
    if (!Number.isFinite(value)) return "Error";
    const rounded = Number(value.toFixed(8));
    return rounded.toLocaleString("en-IN");
  };

  const calculate = (first: number, second: number, selectedOperator: string) => {
    if (selectedOperator === "+") return first + second;
    if (selectedOperator === "-") return first - second;
    if (selectedOperator === "×") return first * second;
    if (selectedOperator === "÷") return second === 0 ? first : first / second;
    return second;
  };

  const inputDigit = (digit: string) => {
    if (display === "Error" || waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
      return;
    }
    setDisplay(display === "0" ? digit : `${display}${digit}`);
  };

  const inputDecimal = () => {
    if (display === "Error" || waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) setDisplay(`${display}.`);
  };

  const clear = () => {
    setDisplay("0");
    setStoredValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const backspace = () => {
    if (waitingForOperand || display === "Error") return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : "0");
  };

  const toggleSign = () => {
    if (display === "Error" || display === "0") return;
    setDisplay(display.startsWith("-") ? display.slice(1) : `-${display}`);
  };

  const percentage = () => {
    if (display === "Error") return;
    setDisplay(formatDisplay(normalizedDisplay / 100));
  };

  const chooseOperator = (nextOperator: string) => {
    if (display === "Error") return;
    const inputValue = normalizedDisplay;
    if (storedValue === null) {
      setStoredValue(inputValue);
    } else if (operator) {
      const result = calculate(storedValue, inputValue, operator);
      setStoredValue(result);
      setDisplay(formatDisplay(result));
    }
    setOperator(nextOperator);
    setWaitingForOperand(true);
  };

  const equals = () => {
    if (storedValue === null || !operator || display === "Error") return;
    const result = calculate(storedValue, normalizedDisplay, operator);
    setDisplay(formatDisplay(result));
    setStoredValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const buttons = [
    { label: "C", action: clear, style: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
    { label: "±", action: toggleSign, style: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
    { label: "%", action: percentage, style: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
    { label: "÷", action: () => chooseOperator("÷"), style: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" },
    { label: "7", action: () => inputDigit("7") },
    { label: "8", action: () => inputDigit("8") },
    { label: "9", action: () => inputDigit("9") },
    { label: "×", action: () => chooseOperator("×"), style: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" },
    { label: "4", action: () => inputDigit("4") },
    { label: "5", action: () => inputDigit("5") },
    { label: "6", action: () => inputDigit("6") },
    { label: "-", action: () => chooseOperator("-"), style: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" },
    { label: "1", action: () => inputDigit("1") },
    { label: "2", action: () => inputDigit("2") },
    { label: "3", action: () => inputDigit("3") },
    { label: "+", action: () => chooseOperator("+"), style: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" },
    { label: "0", action: () => inputDigit("0"), span: "col-span-2" },
    { label: ".", action: inputDecimal },
    { label: "=", action: equals, style: "bg-[#123f31] text-white hover:bg-[#0d3026]" },
  ];

  return (
    <section className="rounded-[1.75rem] bg-white shadow-sm ring-1 ring-slate-100">
      <div className={compact ? "p-4" : "p-5"}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-black text-slate-950">Quick Calculator</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">Rates, quantity, commission, and cash checks</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
            <CalculatorIcon className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 rounded-[1.5rem] bg-[#123f31] px-4 py-4 text-right text-white">
          <p className="text-xs font-semibold text-emerald-100">{storedValue !== null && operator ? `${formatDisplay(storedValue)} ${operator}` : "Ready"}</p>
          <p className="mt-1 min-h-10 break-all text-3xl font-black tracking-tight">{display}</p>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {buttons.map((button) => (
            <button
              key={button.label}
              type="button"
              onClick={button.action}
              className={`h-12 rounded-2xl text-base font-black transition-colors ${button.span || ""} ${button.style || "bg-slate-50 text-slate-950 hover:bg-slate-100"}`}
            >
              {button.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={backspace}
          className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-full text-sm font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <DeleteIcon className="h-4 w-4" />
          Backspace
        </button>
      </div>
    </section>
  );
}