"use client";

import { useEffect, useRef, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

type ConfigResponse = {
  appId: string | null;
  configId: string | null;
  graphVersion: string;
  callbackUrl: string;
  ready: boolean;
};

type ExchangeResult = {
  ok: boolean;
  connected?: boolean;
  wabaId?: string;
  phoneNumberId?: string;
  displayPhoneNumber?: string | null;
  verifiedName?: string | null;
  webhookCallbackUrl?: string;
  verifyToken?: string;
  registrationPin?: string;
  message?: string;
  error?: string;
};

export default function EmbeddedSignupButton({
  businessId,
  onConnected,
}: {
  businessId: string;
  onConnected?: (result: ExchangeResult) => void;
}) {
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExchangeResult | null>(null);
  const sessionRef = useRef<{ wabaId?: string; phoneNumberId?: string }>({});

  // Load config from backend
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`${API}/v1/whatsapp/embedded-signup/config`);
        const data = (await r.json()) as ConfigResponse;
        if (alive) setConfig(data);
      } catch {
        if (alive)
          setError("Could not reach the server to load Embedded Signup config.");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Load Facebook JS SDK + listen for the embedded-signup postMessage
  useEffect(() => {
    if (!config?.appId) return;

    function onMessage(event: MessageEvent) {
      if (
        typeof event.origin !== "string" ||
        !/facebook\.com$/.test(new URL(event.origin).hostname)
      ) {
        return;
      }
      try {
        const payload =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (payload?.type !== "WA_EMBEDDED_SIGNUP") return;
        const data = payload?.data || {};
        if (data.event === "FINISH") {
          sessionRef.current = {
            wabaId: data.waba_id,
            phoneNumberId: data.phone_number_id,
          };
        }
      } catch {
        /* ignore */
      }
    }
    window.addEventListener("message", onMessage);

    if (window.FB) {
      setSdkReady(true);
      return () => window.removeEventListener("message", onMessage);
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: config.appId,
        autoLogAppEvents: true,
        xfbml: false,
        version: config.graphVersion || "v20.0",
      });
      setSdkReady(true);
    };

    const existing = document.getElementById("facebook-jssdk");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      document.body.appendChild(script);
    }

    return () => window.removeEventListener("message", onMessage);
  }, [config?.appId, config?.graphVersion]);

  async function handleConnect() {
    setError(null);
    setResult(null);
    if (!window.FB) {
      setError("Facebook SDK not loaded yet. Try again in a second.");
      return;
    }
    if (!config?.configId) {
      setError(
        "Embedded Signup configuration ID is not set on the server. Add META_EMBEDDED_SIGNUP_CONFIG_ID and retry."
      );
      return;
    }

    setLoading(true);
    sessionRef.current = {};

    const handleResponse = (response: any) => {
      const code = response?.authResponse?.code;
      if (!code) {
        setError(
          response?.status === "not_authorized"
            ? "You closed the WhatsApp signup before finishing."
            : "Could not get a signup code from Facebook."
        );
        setLoading(false);
        return;
      }

      void (async () => {
        try {
          const r = await fetch(
            `${API}/v1/whatsapp/embedded-signup/exchange`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                businessId,
                code,
                wabaId: sessionRef.current.wabaId,
                phoneNumberId: sessionRef.current.phoneNumberId,
              }),
            }
          );
          const data = (await r.json()) as ExchangeResult;
          if (!r.ok || !data.ok) {
            setError(data.error || "Could not finish WhatsApp connection.");
          } else {
            setResult(data);
            onConnected?.(data);
          }
        } catch (e: any) {
          setError(e?.message || "Unexpected error during connect.");
        } finally {
          setLoading(false);
        }
      })();
    };

    window.FB.login(handleResponse, {
      config_id: config.configId,
      response_type: "code",
      override_default_response_type: true,
      extras: { version: "v3", featureType: "whatsapp_embedded_signup" },
    });
  }

  const disabled = loading || !sdkReady || !config?.ready;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[#1d2226]">
            Connect WhatsApp in 1 click
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Sign in with Facebook, pick your business and number, and you&apos;re
            live. No tokens to copy.
          </p>
        </div>
        <span
          className={`inline-flex h-2.5 w-2.5 rounded-full ${
            config?.ready ? "bg-emerald-500" : "bg-amber-400"
          }`}
          title={config?.ready ? "Ready" : "Server config missing"}
        />
      </div>

      <button
        type="button"
        onClick={handleConnect}
        disabled={disabled}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1d2226] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d3238] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Connecting…
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M19.05 4.91A10.1 10.1 0 0 0 12 2C6.5 2 2 6.5 2 12c0 1.77.46 3.5 1.34 5L2 22l5.18-1.34A10 10 0 0 0 12 22c5.5 0 10-4.5 10-10 0-2.7-1.05-5.23-2.95-7.09Zm-7.05 15.4a8.3 8.3 0 0 1-4.2-1.16l-.3-.18-3.07.79.82-3-.2-.31a8.3 8.3 0 1 1 6.95 3.86Zm4.55-6.18c-.25-.13-1.47-.73-1.7-.81-.23-.08-.4-.13-.57.13s-.65.81-.8.98c-.15.17-.3.18-.55.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.15-.25-.02-.39.11-.51.11-.11.25-.3.37-.45.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.57-1.36-.78-1.86-.2-.5-.41-.43-.57-.44h-.49c-.17 0-.45.06-.69.32-.24.25-.91.89-.91 2.17 0 1.28.93 2.52 1.06 2.69.13.17 1.83 2.79 4.43 3.91.62.27 1.1.43 1.48.55.62.2 1.18.17 1.62.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3Z" />
            </svg>
            Connect WhatsApp
          </>
        )}
      </button>

      {!config?.ready && (
        <p className="mt-3 text-xs text-amber-600">
          Server config missing. Set <code>META_APP_ID</code>,{" "}
          <code>META_APP_SECRET</code>, and{" "}
          <code>META_EMBEDDED_SIGNUP_CONFIG_ID</code> in backend env.
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result?.connected && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <div className="font-semibold">Connected ✓</div>
          <ul className="mt-1 space-y-0.5">
            {result.displayPhoneNumber && (
              <li>Number: {result.displayPhoneNumber}</li>
            )}
            {result.verifiedName && <li>Verified name: {result.verifiedName}</li>}
            {result.phoneNumberId && (
              <li className="font-mono text-xs">
                phone_number_id: {result.phoneNumberId}
              </li>
            )}
            {result.wabaId && (
              <li className="font-mono text-xs">waba_id: {result.wabaId}</li>
            )}
          </ul>
          <p className="mt-2">{result.message}</p>
        </div>
      )}
    </div>
  );
}
