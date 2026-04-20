export type EmailTemplateType =
  | "invoice_received"
  | "invoice_approved"
  | "invoice_rejected"
  | "invoice_flagged"
  | "payment_confirmed";

export interface EmailSettings {
  brandName: string;
  senderDisplayName: string;
  supportEmail: string;
  companyAddress: string;
  paymentTermsDays: number;
  defaultCurrency: string;
  logoUrl?: string;
}

export interface EmailInvoiceData {
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  total?: number;
  currency?: string;
  vendor?: string;
  vendorEmail?: string;
  subtotal?: number;
  tax?: number;
  discount?: number;
  rejectionReason?: string;
  flagMessages?: string[];
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
  paidAt?: string;
  paidNote?: string;
  lineItems?: Array<{ description: string; amount?: number }>;
}

const COLORS = {
  invoice_received: { accent: "#7c3aed", label: "Invoice Received", badge: "#ede9fe", badgeText: "#6d28d9" },
  invoice_approved: { accent: "#059669", label: "Invoice Approved", badge: "#d1fae5", badgeText: "#065f46" },
  invoice_rejected: { accent: "#dc2626", label: "Action Required", badge: "#fee2e2", badgeText: "#991b1b" },
  invoice_flagged:  { accent: "#d97706", label: "Query Raised",    badge: "#fef3c7", badgeText: "#92400e" },
  payment_confirmed:{ accent: "#0ea5e9", label: "Payment Sent",    badge: "#e0f2fe", badgeText: "#0369a1" },
};

function fmtCurrency(amount: number | undefined, currency?: string): string {
  if (amount == null) return "—";
  const code = (currency ?? "INR").trim().toUpperCase();
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: code, minimumFractionDigits: 2 }).format(amount);
  } catch {
    return `${code} ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  }
}

function fmtDate(d?: string): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return d;
  }
}

function base(settings: EmailSettings, type: EmailTemplateType, subject: string, bodyContent: string): string {
  const col = COLORS[type];
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <!-- Header bar -->
      <tr><td style="background:${col.accent};padding:28px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              ${settings.logoUrl ? `<img src="${settings.logoUrl}" alt="${settings.brandName}" style="height:36px;display:block;margin-bottom:8px;"/>` : ""}
              <span style="color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">${settings.brandName}</span>
            </td>
            <td align="right">
              <span style="background:rgba(255,255,255,0.18);color:#fff;font-size:12px;font-weight:700;padding:6px 14px;border-radius:999px;letter-spacing:0.3px;">${col.label}</span>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:36px 40px;">
        ${bodyContent}
      </td></tr>

      <!-- Divider -->
      <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"/></td></tr>

      <!-- Footer -->
      <tr><td style="padding:24px 40px;background:#f9fafb;border-radius:0 0 16px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#6b7280;font-size:12px;line-height:1.6;">
              <strong style="color:#374151;">${settings.senderDisplayName}</strong><br/>
              ${settings.brandName}${settings.companyAddress ? ",&nbsp;" + settings.companyAddress : ""}<br/>
              <a href="mailto:${settings.supportEmail}" style="color:${col.accent};text-decoration:none;">${settings.supportEmail}</a>
            </td>
            <td align="right" style="color:#9ca3af;font-size:11px;">
              © ${year} ${settings.brandName}<br/>
              <span style="color:#d1d5db;">Powered by Plyndrox AP AI</span>
            </td>
          </tr>
        </table>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function detailsTable(rows: Array<[string, string]>, accentColor: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin:20px 0;">
${rows.map(([k, v], i) => `  <tr style="background:${i % 2 === 0 ? "#f9fafb" : "#ffffff"};">
    <td style="padding:12px 16px;color:#6b7280;font-size:13px;font-weight:600;width:44%;border-right:1px solid #f3f4f6;">${k}</td>
    <td style="padding:12px 16px;color:#111827;font-size:13px;font-weight:700;">${v}</td>
  </tr>`).join("\n")}
</table>`;
}

function sectionTitle(text: string): string {
  return `<p style="margin:24px 0 0;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9ca3af;">${text}</p>`;
}

function heading(text: string, color: string): string {
  return `<h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${color};letter-spacing:-0.5px;">${text}</h1>`;
}

function greeting(vendor?: string): string {
  const name = vendor ? `${vendor} team` : "team";
  return `<p style="margin:0 0 20px;font-size:15px;color:#374151;">Dear <strong>${name}</strong>,</p>`;
}

function noteBox(text: string, bg: string, border: string, textColor: string): string {
  return `<div style="background:${bg};border:1px solid ${border};border-radius:10px;padding:14px 18px;margin:20px 0;">
  <p style="margin:0;font-size:13px;line-height:1.6;color:${textColor};">${text}</p>
</div>`;
}

export function buildSubjectLine(type: EmailTemplateType, inv: EmailInvoiceData, settings: EmailSettings): string {
  const num = inv.invoiceNumber ? `Invoice ${inv.invoiceNumber}` : "Invoice";
  switch (type) {
    case "invoice_received":   return `${num} received — ${settings.brandName}`;
    case "invoice_approved":   return `${num} approved — Payment in ${settings.paymentTermsDays} days — ${settings.brandName}`;
    case "invoice_rejected":   return `Action required — ${num} — ${settings.brandName}`;
    case "invoice_flagged":    return `Query regarding ${num} — ${settings.brandName}`;
    case "payment_confirmed":  return `Payment confirmation — ${num} — ${settings.brandName}`;
  }
}

export function buildEmailHtml(type: EmailTemplateType, inv: EmailInvoiceData, settings: EmailSettings): string {
  const col = COLORS[type];
  const subject = buildSubjectLine(type, inv, settings);
  const num = inv.invoiceNumber ?? "N/A";
  const currency = inv.currency ?? settings.defaultCurrency;
  const termsDays = settings.paymentTermsDays;

  const invoiceRows: Array<[string, string]> = [
    ["Invoice Number", num],
    ["Invoice Date", fmtDate(inv.invoiceDate)],
    ["Amount", fmtCurrency(inv.total, currency)],
  ];

  switch (type) {
    case "invoice_received": {
      const body = `
        ${heading("Invoice Received", col.accent)}
        ${greeting(inv.vendor)}
        <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
          Thank you for submitting your invoice. We have successfully received it and our AP team is currently reviewing the details.
        </p>
        ${sectionTitle("Invoice Details")}
        ${detailsTable([...invoiceRows, ["Status", `<span style="background:${col.badge};color:${col.badgeText};padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;">Under Review</span>`]], col.accent)}
        ${noteBox(
          `Our standard payment terms are <strong>Net ${termsDays}</strong>. You will receive a follow-up notification once the invoice has been reviewed and processed.`,
          "#f9fafb", "#e5e7eb", "#4b5563"
        )}
        <p style="margin:20px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
          No action is required from your end at this stage. If you have any questions, please contact us at 
          <a href="mailto:${settings.supportEmail}" style="color:${col.accent};">${settings.supportEmail}</a>.
        </p>`;
      return base(settings, type, subject, body);
    }

    case "invoice_approved": {
      const payByDate = inv.dueDate
        ? fmtDate(inv.dueDate)
        : (() => { const d = new Date(); d.setDate(d.getDate() + termsDays); return fmtDate(d.toISOString()); })();

      const bankLine = inv.bankDetails?.bankName
        ? `your <strong>${inv.bankDetails.bankName}</strong> account${inv.bankDetails.accountNumber ? ` (A/C ending ${inv.bankDetails.accountNumber.slice(-4)})` : ""}${inv.bankDetails.ifscCode ? ` via NEFT/RTGS` : ""}`
        : "your registered bank account";

      const body = `
        ${heading("Invoice Approved", col.accent)}
        ${greeting(inv.vendor)}
        <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
          We are pleased to inform you that your invoice has been reviewed and <strong style="color:${col.accent};">approved</strong> by our accounts payable team.
        </p>
        ${sectionTitle("Invoice Details")}
        ${detailsTable([
          ...invoiceRows,
          ["Status", `<span style="background:${col.badge};color:${col.badgeText};padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;">✓ Approved</span>`],
        ], col.accent)}
        ${sectionTitle("Payment Details")}
        ${noteBox(
          `Payment of <strong>${fmtCurrency(inv.total, currency)}</strong> will be processed to ${bankLine} on or before <strong>${payByDate}</strong>, as per our <strong>Net ${termsDays}</strong> payment terms.`,
          "#f0fdf4", "#bbf7d0", "#14532d"
        )}
        <p style="margin:20px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
          No further action is required from your end. You will receive a payment confirmation email once the transfer is complete. 
          For any queries, please reach us at <a href="mailto:${settings.supportEmail}" style="color:${col.accent};">${settings.supportEmail}</a>.
        </p>`;
      return base(settings, type, subject, body);
    }

    case "invoice_rejected": {
      const reason = inv.rejectionReason ?? "We were unable to process this invoice due to discrepancies in the submitted details.";
      const body = `
        ${heading("Action Required", col.accent)}
        ${greeting(inv.vendor)}
        <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
          We regret to inform you that we are unable to process your invoice at this time. Please review the details below and resubmit with the necessary corrections.
        </p>
        ${sectionTitle("Invoice Details")}
        ${detailsTable([
          ...invoiceRows,
          ["Status", `<span style="background:${col.badge};color:${col.badgeText};padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;">✗ Rejected</span>`],
        ], col.accent)}
        ${sectionTitle("Reason for Rejection")}
        ${noteBox(reason, "#fff7f7", "#fecaca", "#7f1d1d")}
        <p style="margin:20px 0 0;font-size:15px;color:#374151;line-height:1.6;">
          Please address the issue mentioned above and resubmit your invoice. Once resubmitted, we will review it promptly.
        </p>
        <p style="margin:16px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
          If you believe this is an error or have any questions, please contact us at 
          <a href="mailto:${settings.supportEmail}" style="color:${col.accent};">${settings.supportEmail}</a>.
        </p>`;
      return base(settings, type, subject, body);
    }

    case "invoice_flagged": {
      const flags = inv.flagMessages ?? ["Our AI system flagged a concern with the submitted invoice."];
      const body = `
        ${heading("Query Regarding Invoice", col.accent)}
        ${greeting(inv.vendor)}
        <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
          Thank you for submitting your invoice. Our accounts payable system has raised the following query that requires clarification before we can proceed with processing.
        </p>
        ${sectionTitle("Invoice Details")}
        ${detailsTable([...invoiceRows, ["Status", `<span style="background:${col.badge};color:${col.badgeText};padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;">Under Query</span>`]], col.accent)}
        ${sectionTitle("Query Details")}
        <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:14px 18px;margin:16px 0;">
          ${flags.map(f => `<p style="margin:4px 0;font-size:13px;color:#78350f;line-height:1.6;">⚠ ${f}</p>`).join("")}
        </div>
        <p style="margin:20px 0 0;font-size:15px;color:#374151;line-height:1.6;">
          Please review the points above and revert with the necessary clarification or a corrected invoice. 
          We will proceed with processing once the query is resolved.
        </p>
        <p style="margin:16px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
          Contact our AP team at <a href="mailto:${settings.supportEmail}" style="color:${col.accent};">${settings.supportEmail}</a> if you need further assistance.
        </p>`;
      return base(settings, type, subject, body);
    }

    case "payment_confirmed": {
      const paidDate = inv.paidAt ? fmtDate(inv.paidAt) : fmtDate(new Date().toISOString());
      const bankLine = inv.bankDetails?.bankName
        ? `your <strong>${inv.bankDetails.bankName}</strong> account${inv.bankDetails.accountNumber ? ` (A/C ending ${inv.bankDetails.accountNumber.slice(-4)})` : ""}`
        : "your registered bank account";

      const body = `
        ${heading("Payment Sent", col.accent)}
        ${greeting(inv.vendor)}
        <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
          We are pleased to confirm that payment for the invoice listed below has been successfully processed and dispatched.
        </p>
        ${sectionTitle("Invoice Details")}
        ${detailsTable([
          ...invoiceRows,
          ["Payment Date", paidDate],
          ["Status", `<span style="background:${col.badge};color:${col.badgeText};padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;">✓ Payment Sent</span>`],
        ], col.accent)}
        ${noteBox(
          `Payment of <strong>${fmtCurrency(inv.total, currency)}</strong> has been dispatched to ${bankLine} on <strong>${paidDate}</strong>.${inv.paidNote ? " " + inv.paidNote : ""}`,
          "#f0f9ff", "#bae6fd", "#0c4a6e"
        )}
        <p style="margin:20px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
          Please allow 1–3 business days for the amount to reflect in your account, depending on your bank's processing time. 
          If you have not received the payment within this timeframe, please contact us at 
          <a href="mailto:${settings.supportEmail}" style="color:${col.accent};">${settings.supportEmail}</a>.
        </p>
        <p style="margin:16px 0 0;font-size:14px;color:#374151;line-height:1.6;">
          Thank you for your business. We look forward to continuing our partnership.
        </p>`;
      return base(settings, type, subject, body);
    }
  }
}
