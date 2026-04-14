"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { ibaraUrl } from "@/lib/ibaraApi";

type Method = "wordpress" | "gtm" | "file" | "manual" | null;
type Platform = "wordpress" | "shopify" | "wix" | "squarespace" | "webflow" | "html" | "unknown";

interface DetectResult {
  platform: Platform;
  details: Record<string, string>;
  hasIbaraWidget: boolean;
  domain: string;
}

interface ConnectionState {
  connectionMethod: Method;
  connectionStatus: "not_connected" | "connected" | "pending";
  connectionVerifiedAt: string | null;
  detectedPlatform: string;
}

const BACKEND = "https://raina-1.onrender.com";
const WIDGET_CDN = "https://www.plyndrox.app/ibara-widget.js";
const API_BASE = "https://raina-1.onrender.com";

function ConnectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = searchParams.get("siteId") || "";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState<DetectResult | null>(null);
  const [connection, setConnection] = useState<ConnectionState | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<Method>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ isLive: boolean; message: string } | null>(null);

  const [wpUrl, setWpUrl] = useState("");
  const [wpUsername, setWpUsername] = useState("");
  const [wpAppPassword, setWpAppPassword] = useState("");
  const [wpConnecting, setWpConnecting] = useState(false);
  const [wpResult, setWpResult] = useState<{ success: boolean; message: string } | null>(null);

  const [gtmId, setGtmId] = useState("");
  const [gtmSaving, setGtmSaving] = useState(false);

  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    if (!siteId) return;
    let auth;
    try { auth = getFirebaseAuth(); } catch {
      router.replace("/ibara/auth");
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.replace("/ibara/auth"); return; }
      setUser(u);
      try {
        const [sitesRes, connRes] = await Promise.all([
          fetch(ibaraUrl(`/sites?userId=${u.uid}`)),
          fetch(ibaraUrl(`/sites/${siteId}/connection`)),
        ]);
        const sitesData = await sitesRes.json();
        const connData = await connRes.json();
        const found = sitesData.sites?.find((s: any) => s._id === siteId);
        if (found) {
          setDomain(found.domain);
          setWpUrl(`https://${found.domain}`);
          if (connData.connectionMethod) {
            setSelectedMethod(connData.connectionMethod);
          }
          setConnection(connData);
          if (!connData.detectedPlatform || connData.detectedPlatform === "unknown" || connData.detectedPlatform === "") {
            detectPlatform(found.domain);
          } else {
            setDetected({ platform: connData.detectedPlatform as Platform, details: {}, hasIbaraWidget: connData.connectionStatus === "connected", domain: found.domain });
          }
        }
      } catch {}
      setLoading(false);
    });
    return () => unsub();
  }, [siteId, router]);

  const detectPlatform = async (d: string) => {
    setDetecting(true);
    try {
      const res = await fetch(ibaraUrl("/detect-platform"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: d }),
      });
      const data = await res.json();
      setDetected(data);
      if (data.platform && data.platform !== "unknown") {
        await fetch(ibaraUrl(`/sites/${siteId}/connection`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user?.uid, detectedPlatform: data.platform }),
        });
      }
    } catch {}
    setDetecting(false);
  };

  const saveConnectionMethod = async (method: Method, status: "not_connected" | "pending" | "connected" = "pending") => {
    if (!user) return;
    try {
      await fetch(ibaraUrl(`/sites/${siteId}/connection`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, connectionMethod: method, connectionStatus: status }),
      });
      setConnection((prev) => prev ? { ...prev, connectionMethod: method, connectionStatus: status } : null);
    } catch {}
  };

  const handleWordPressConnect = async () => {
    if (!user || !wpUsername || !wpAppPassword) return;
    setWpConnecting(true);
    setWpResult(null);
    try {
      const res = await fetch(ibaraUrl(`/sites/${siteId}/wordpress-connect`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, wpUrl, wpUsername, wpAppPassword }),
      });
      const data = await res.json();
      setWpResult(data);
      if (data.success) {
        setConnection((prev) => prev ? { ...prev, connectionMethod: "wordpress", connectionStatus: "pending" } : null);
      }
    } catch {
      setWpResult({ success: false, message: "Connection failed. Please try again." });
    }
    setWpConnecting(false);
  };

  const handleDownloadPlugin = () => {
    window.open(`${BACKEND}/api/ibara/sites/${siteId}/generate-plugin`, "_blank");
    saveConnectionMethod("wordpress", "pending");
  };

  const handleDownloadInstaller = () => {
    window.open(`${BACKEND}/api/ibara/sites/${siteId}/generate-installer`, "_blank");
    saveConnectionMethod("file", "pending");
  };

  const handleGtmSave = async () => {
    if (!gtmId.trim()) return;
    setGtmSaving(true);
    await saveConnectionMethod("gtm", "pending");
    setGtmSaving(false);
  };

  const handleManualSelect = async () => {
    await saveConnectionMethod("manual", "pending");
  };

  const handleVerifyConnection = async () => {
    if (!user) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch(ibaraUrl(`/sites/${siteId}/verify-connection`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });
      const data = await res.json();
      if (data.isLive) {
        setVerifyResult({ isLive: true, message: "Your chatbot is live on the website!" });
        setConnection((prev) => prev ? { ...prev, connectionStatus: "connected" } : null);
      } else {
        setVerifyResult({ isLive: false, message: "Chatbot not detected yet. Please complete the installation steps and try again." });
      }
    } catch {
      setVerifyResult({ isLive: false, message: "Verification failed. Please try again." });
    }
    setVerifying(false);
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  };

  const embedCode = `<script src="${WIDGET_CDN}" data-site-id="${siteId}" data-api-base="${API_BASE}" async defer></script>`;
  const gtmScript = `<script>
window.dataLayer = window.dataLayer || [];
(function(){
  var s = document.createElement('script');
  s.src = '${WIDGET_CDN}';
  s.setAttribute('data-site-id', '${siteId}');
  s.setAttribute('data-api-base', '${API_BASE}');
  s.async = true;
  document.body.appendChild(s);
})();
</script>`;

  const platformLabel: Record<string, string> = {
    wordpress: "WordPress",
    shopify: "Shopify",
    wix: "Wix",
    squarespace: "Squarespace",
    webflow: "Webflow",
    html: "HTML/Custom Site",
    unknown: "Custom Website",
  };

  const platformIcon: Record<string, string> = {
    wordpress: "🔷",
    shopify: "🟩",
    wix: "⬜",
    squarespace: "◼",
    webflow: "🔵",
    html: "📄",
    unknown: "🌐",
  };

  const isConnected = connection?.connectionStatus === "connected";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .card-glass { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); }
        .method-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); transition: all 0.2s; cursor: pointer; }
        .method-card:hover { border-color: rgba(124,58,237,0.4); background: rgba(124,58,237,0.05); }
        .method-card.selected { border-color: rgba(124,58,237,0.6); background: rgba(124,58,237,0.08); }
        .method-card.recommended { border-color: rgba(6,182,212,0.3); }
        .input-field { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); transition: all 0.2s; }
        .input-field:focus { border-color: rgba(124,58,237,0.6); outline: none; background: rgba(124,58,237,0.05); }
        .btn-primary { background: linear-gradient(135deg, #7c3aed, #06b6d4); transition: all 0.3s ease; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(124,58,237,0.35); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .code-block { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.6; }
        .step-num { width: 24px; height: 24px; border-radius: 50%; background: rgba(124,58,237,0.2); border: 1px solid rgba(124,58,237,0.4); color: #a78bfa; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .gradient-text { background: linear-gradient(135deg, #a78bfa, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black mb-1">Connect Your Website</h1>
          <p className="text-white/30 text-sm">Choose how to add the chatbot to <span className="text-white/60 font-medium">{domain}</span></p>
        </div>
        {isConnected && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border text-green-400 bg-green-400/10 border-green-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Chatbot Live
          </div>
        )}
      </div>

      {isConnected && (
        <div className="card-glass rounded-2xl p-6 mb-6 border-green-500/20 bg-green-500/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-2xl">✅</div>
            <div>
              <h2 className="font-bold text-green-300 mb-0.5">Your chatbot is connected and live!</h2>
              <p className="text-sm text-green-300/50">The Ibara AI chatbot is running on <strong>{domain}</strong></p>
            </div>
            <button
              onClick={() => window.open(`https://${domain}`, "_blank")}
              className="ml-auto px-4 py-2 rounded-xl border border-green-500/30 text-green-300 text-xs font-semibold hover:bg-green-500/10 transition-all"
            >
              Visit Site →
            </button>
          </div>
        </div>
      )}

      {detecting && (
        <div className="card-glass rounded-2xl p-4 mb-6 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <span className="text-sm text-white/50">Detecting your website platform...</span>
        </div>
      )}

      {detected && !detecting && (
        <div className="card-glass rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">{platformIcon[detected.platform] || "🌐"}</span>
          <div>
            <p className="text-sm font-semibold text-white/80">
              Detected: <span className="gradient-text">{platformLabel[detected.platform] || "Custom Website"}</span>
              {detected.platform === "wordpress" && detected.details.siteName && (
                <span className="text-white/30 font-normal"> — {detected.details.siteName}</span>
              )}
            </p>
            {detected.hasIbaraWidget
              ? <p className="text-xs text-green-400">Ibara AI widget already detected on your site!</p>
              : <p className="text-xs text-white/30">We'll recommend the best connection method for your platform.</p>
            }
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="font-bold text-sm text-white/50 uppercase tracking-wider mb-4">Choose Connection Method</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          <div
            onClick={() => setSelectedMethod("wordpress")}
            className={`method-card rounded-2xl p-5 ${selectedMethod === "wordpress" ? "selected" : ""} ${detected?.platform === "wordpress" ? "recommended" : ""}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔷</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm">WordPress</p>
                  {detected?.platform === "wordpress" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Recommended</span>
                  )}
                </div>
                <p className="text-xs text-white/40 leading-relaxed">Upload our plugin or auto-connect using your WP admin credentials. Zero code.</p>
              </div>
              {selectedMethod === "wordpress" && <span className="text-violet-400 text-lg mt-0.5">✓</span>}
            </div>
          </div>

          <div
            onClick={() => setSelectedMethod("gtm")}
            className={`method-card rounded-2xl p-5 ${selectedMethod === "gtm" ? "selected" : ""}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏷️</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm">Google Tag Manager</p>
                  {(detected?.platform === "shopify" || detected?.platform === "webflow") && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Recommended</span>
                  )}
                </div>
                <p className="text-xs text-white/40 leading-relaxed">Works on any site with GTM. Add a custom HTML tag — no code needed.</p>
              </div>
              {selectedMethod === "gtm" && <span className="text-violet-400 text-lg mt-0.5">✓</span>}
            </div>
          </div>

          <div
            onClick={() => setSelectedMethod("file")}
            className={`method-card rounded-2xl p-5 ${selectedMethod === "file" ? "selected" : ""} ${detected?.platform === "html" ? "recommended" : ""}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">📁</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm">File Upload (cPanel)</p>
                  {detected?.platform === "html" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Recommended</span>
                  )}
                </div>
                <p className="text-xs text-white/40 leading-relaxed">Download a one-time PHP installer, upload to your site, and it connects automatically.</p>
              </div>
              {selectedMethod === "file" && <span className="text-violet-400 text-lg mt-0.5">✓</span>}
            </div>
          </div>

          <div
            onClick={() => setSelectedMethod("manual")}
            className={`method-card rounded-2xl p-5 ${selectedMethod === "manual" ? "selected" : ""}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <div className="flex-1">
                <p className="font-bold text-sm mb-1">Manual / Embed Code</p>
                <p className="text-xs text-white/40 leading-relaxed">Copy one script tag and paste it into your site. Works everywhere.</p>
              </div>
              {selectedMethod === "manual" && <span className="text-violet-400 text-lg mt-0.5">✓</span>}
            </div>
          </div>
        </div>
      </div>

      {selectedMethod === "wordpress" && (
        <div className="card-glass rounded-2xl p-6 mb-6 space-y-6">
          <h2 className="font-bold flex items-center gap-2">
            <span className="text-xl">🔷</span> WordPress Connection
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
              <p className="font-bold text-sm text-violet-300 mb-3">Option A — Download Plugin (Easiest)</p>
              <div className="space-y-3 mb-4">
                {["Download the Ibara AI plugin file (.php)", "Go to WordPress Admin → Plugins → Add New → Upload Plugin", "Upload the downloaded file and click Install Now", "Click Activate Plugin — done!"].map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="step-num mt-0.5">{i + 1}</span>
                    <p className="text-xs text-white/60 leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={handleDownloadPlugin}
                className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-white"
              >
                ⬇ Download WordPress Plugin
              </button>
            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
              <p className="font-bold text-sm text-cyan-300 mb-3">Option B — Auto-Connect (Advanced)</p>
              <p className="text-xs text-white/40 mb-3 leading-relaxed">
                Use your WordPress Application Password to let us install automatically. Go to{" "}
                <span className="text-cyan-400">WP Admin → Users → Your Profile → Application Passwords</span> to create one.
              </p>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-[11px] text-white/40 block mb-1">WordPress URL</label>
                  <input
                    type="text"
                    value={wpUrl}
                    onChange={(e) => setWpUrl(e.target.value)}
                    placeholder="https://yoursite.com"
                    className="input-field w-full h-10 rounded-xl px-3 text-sm text-white placeholder:text-white/20"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/40 block mb-1">Username</label>
                  <input
                    type="text"
                    value={wpUsername}
                    onChange={(e) => setWpUsername(e.target.value)}
                    placeholder="admin"
                    className="input-field w-full h-10 rounded-xl px-3 text-sm text-white placeholder:text-white/20"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/40 block mb-1">Application Password</label>
                  <input
                    type="password"
                    value={wpAppPassword}
                    onChange={(e) => setWpAppPassword(e.target.value)}
                    placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                    className="input-field w-full h-10 rounded-xl px-3 text-sm text-white placeholder:text-white/20"
                  />
                </div>
              </div>
              {wpResult && (
                <div className={`mb-3 rounded-xl px-3 py-2.5 text-xs ${wpResult.success ? "bg-green-500/10 border border-green-500/30 text-green-300" : "bg-red-500/10 border border-red-500/30 text-red-300"}`}>
                  {wpResult.message}
                </div>
              )}
              <button
                onClick={handleWordPressConnect}
                disabled={wpConnecting || !wpUsername || !wpAppPassword}
                className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-white"
              >
                {wpConnecting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </span>
                ) : "Auto-Connect WordPress"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedMethod === "gtm" && (
        <div className="card-glass rounded-2xl p-6 mb-6">
          <h2 className="font-bold flex items-center gap-2 mb-5">
            <span className="text-xl">🏷️</span> Google Tag Manager Setup
          </h2>
          <div className="space-y-4 mb-6">
            {[
              { step: 1, text: "Open Google Tag Manager (tagmanager.google.com) and go to your container" },
              { step: 2, text: "Click Tags → New → Tag Configuration → Custom HTML" },
              { step: 3, text: "Paste the script below into the HTML field" },
              { step: 4, text: "Set Trigger to: All Pages" },
              { step: 5, text: "Save and click Submit → Publish" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="step-num mt-0.5">{step}</span>
                <p className="text-sm text-white/60 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Script to paste in GTM</p>
              <button
                onClick={() => copyCode(gtmScript)}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                {codeCopied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="code-block rounded-xl p-4 text-white/70 whitespace-pre-wrap break-all">
              {gtmScript}
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs text-white/40 block mb-1.5">Your GTM Container ID (optional, for our records)</label>
            <input
              type="text"
              value={gtmId}
              onChange={(e) => setGtmId(e.target.value)}
              placeholder="GTM-XXXXXXX"
              className="input-field w-full h-11 rounded-xl px-3.5 text-sm text-white placeholder:text-white/20"
            />
          </div>
          <button
            onClick={handleGtmSave}
            disabled={gtmSaving}
            className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-white"
          >
            {gtmSaving ? "Saving..." : "I've Published in GTM →"}
          </button>
        </div>
      )}

      {selectedMethod === "file" && (
        <div className="card-glass rounded-2xl p-6 mb-6">
          <h2 className="font-bold flex items-center gap-2 mb-5">
            <span className="text-xl">📁</span> One-Time File Upload
          </h2>
          <div className="space-y-4 mb-6">
            {[
              { step: 1, text: "Click 'Download Installer File' below to get your ibara-connect.php file" },
              { step: 2, text: "Log into your hosting control panel (cPanel, Plesk, etc.)" },
              { step: 3, text: "Open File Manager and navigate to your website's root folder (public_html)" },
              { step: 4, text: "Upload the ibara-connect.php file to that folder" },
              { step: 5, text: `Visit: https://${domain}/ibara-connect.php and click "Install Chatbot Now"` },
              { step: 6, text: "The chatbot installs automatically. You can delete the file afterwards." },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="step-num mt-0.5">{step}</span>
                <p className="text-sm text-white/60 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4">
            <p className="text-xs text-amber-300/80">
              <strong>No FTP needed.</strong> Use your hosting's built-in File Manager — available in cPanel, Plesk, and most control panels.
            </p>
          </div>
          <button
            onClick={handleDownloadInstaller}
            className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-white"
          >
            ⬇ Download Installer File
          </button>
        </div>
      )}

      {selectedMethod === "manual" && (
        <div className="card-glass rounded-2xl p-6 mb-6">
          <h2 className="font-bold flex items-center gap-2 mb-5">
            <span className="text-xl">📋</span> Manual Embed
          </h2>
          <p className="text-sm text-white/50 mb-4 leading-relaxed">
            Copy the script below and paste it just before the <code className="text-violet-300">&lt;/body&gt;</code> tag on every page of your website.
          </p>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Your unique embed script</p>
              <button
                onClick={() => copyCode(embedCode)}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                {codeCopied ? "✓ Copied!" : "Copy Code"}
              </button>
            </div>
            <div className="code-block rounded-xl p-4 text-white/70 break-all">
              {embedCode}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {[
              { platform: "WordPress", instruction: "Appearance → Theme Editor → Add before </body> in footer.php" },
              { platform: "Shopify", instruction: "Online Store → Themes → Edit Code → theme.liquid before </body>" },
              { platform: "Wix", instruction: "Settings → Custom Code → Add to Body (End)" },
              { platform: "Squarespace", instruction: "Settings → Advanced → Code Injection → Footer" },
            ].map(({ platform, instruction }) => (
              <div key={platform} className="rounded-xl bg-white/3 border border-white/6 p-3">
                <p className="text-xs font-semibold text-white/70 mb-1">{platform}</p>
                <p className="text-[11px] text-white/35 leading-relaxed">{instruction}</p>
              </div>
            ))}
          </div>
          <button
            onClick={handleManualSelect}
            className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-white"
          >
            I've Added the Script →
          </button>
        </div>
      )}

      {selectedMethod && (
        <div className="card-glass rounded-2xl p-6">
          <h2 className="font-bold mb-2 flex items-center gap-2">
            <span>🔍</span> Verify Connection
          </h2>
          <p className="text-sm text-white/40 mb-4">
            After completing the installation steps above, click the button below to confirm your chatbot is live.
          </p>
          {verifyResult && (
            <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${verifyResult.isLive ? "bg-green-500/10 border border-green-500/30 text-green-300" : "bg-amber-500/10 border border-amber-500/30 text-amber-300"}`}>
              {verifyResult.isLive ? "✅ " : "⚠️ "}{verifyResult.message}
            </div>
          )}
          {isConnected ? (
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/ibara/dashboard/overview?siteId=${siteId}`)}
                className="btn-primary flex-1 py-3 rounded-xl text-sm font-bold text-white"
              >
                Go to Dashboard →
              </button>
              <button
                onClick={() => window.open(`https://${domain}`, "_blank")}
                className="px-5 py-3 rounded-xl border border-white/10 hover:border-white/20 text-sm font-semibold text-white/60 hover:text-white transition-all"
              >
                Visit Site
              </button>
            </div>
          ) : (
            <button
              onClick={handleVerifyConnection}
              disabled={verifying}
              className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-white"
            >
              {verifying ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Checking your website...
                </span>
              ) : "Verify My Bot is Live →"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ConnectPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    }>
      <ConnectContent />
    </Suspense>
  );
}
