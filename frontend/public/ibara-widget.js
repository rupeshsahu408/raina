(function () {
  "use strict";

  var SCRIPT_TAG = document.currentScript || (function () {
    var scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1];
  })();

  var SITE_ID = SCRIPT_TAG.getAttribute("data-site-id") || "";
  var API_BASE = SCRIPT_TAG.getAttribute("data-api-base") || (function () {
    var src = SCRIPT_TAG.src || "";
    var m = src.match(/^(https?:\/\/[^\/]+)/);
    return m ? m[1] : "";
  })();

  if (!SITE_ID) {
    console.warn("[Plyndrox Web AI] Missing data-site-id attribute on script tag.");
    return;
  }

  var COLORS = {
    primary: "#7C3AED",
    secondary: "#06B6D4",
    bg: "#0B0B1E",
    surface: "#12122A",
    border: "rgba(255,255,255,0.08)",
    text: "#F0F0FF",
    muted: "rgba(240,240,255,0.45)",
  };

  var botName = "Plyndrox Web Assistant";
  var botWelcome = "Hi there! How can I help you today?";
  var isOpen = false;
  var isLoading = false;
  var conversationHistory = [];

  var styles = [
    "#ibara-widget-btn {",
    "  position: fixed; bottom: 24px; right: 24px; z-index: 2147483647;",
    "  width: 60px; height: 60px; border-radius: 50%;",
    "  background: linear-gradient(135deg, #7C3AED, #06B6D4);",
    "  border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;",
    "  box-shadow: 0 8px 32px rgba(124,58,237,0.45), 0 2px 8px rgba(0,0,0,0.3);",
    "  transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease;",
    "  outline: none;",
    "}",
    "#ibara-widget-btn:hover { transform: scale(1.1); box-shadow: 0 12px 40px rgba(124,58,237,0.6), 0 2px 8px rgba(0,0,0,0.3); }",
    "#ibara-widget-btn:active { transform: scale(0.96); }",
    "#ibara-badge {",
    "  position: absolute; top: 2px; right: 2px; width: 13px; height: 13px;",
    "  border-radius: 50%; background: #22C55E;",
    "  border: 2px solid #0B0B1E;",
    "  animation: ibara-pulse 2s ease-in-out infinite;",
    "}",
    "#ibara-chat-window {",
    "  position: fixed; bottom: 96px; right: 24px; z-index: 2147483646;",
    "  width: 380px; height: 560px; max-height: calc(100vh - 120px);",
    "  background: #0B0B1E; border: 1px solid rgba(255,255,255,0.08);",
    "  border-radius: 20px; display: flex; flex-direction: column;",
    "  box-shadow: 0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.15);",
    "  overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;",
    "  opacity: 0; transform: translateY(20px) scale(0.95); pointer-events: none;",
    "  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(.34,1.56,.64,1);",
    "}",
    "#ibara-chat-window.ibara-open {",
    "  opacity: 1; transform: translateY(0) scale(1); pointer-events: all;",
    "}",
    "#ibara-header {",
    "  background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.15));",
    "  border-bottom: 1px solid rgba(255,255,255,0.07);",
    "  padding: 14px 16px; display: flex; align-items: center; gap: 10px; flex-shrink: 0;",
    "}",
    "#ibara-avatar {",
    "  width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;",
    "  background: linear-gradient(135deg, #7C3AED, #06B6D4);",
    "  display: flex; align-items: center; justify-content: center; font-size: 18px;",
    "}",
    "#ibara-header-info { flex: 1; min-width: 0; }",
    "#ibara-header-name { color: #F0F0FF; font-weight: 700; font-size: 14px; line-height: 1.2; }",
    "#ibara-header-status { display: flex; align-items: center; gap: 5px; margin-top: 2px; }",
    "#ibara-status-dot {",
    "  width: 6px; height: 6px; border-radius: 50%; background: #22C55E;",
    "  animation: ibara-pulse 2s ease-in-out infinite;",
    "}",
    "#ibara-status-text { color: rgba(240,240,255,0.4); font-size: 11px; }",
    "#ibara-close-btn {",
    "  background: rgba(255,255,255,0.06); border: none; cursor: pointer;",
    "  width: 30px; height: 30px; border-radius: 8px;",
    "  color: rgba(240,240,255,0.5); font-size: 16px; line-height: 1;",
    "  display: flex; align-items: center; justify-content: center;",
    "  transition: background 0.2s, color 0.2s; flex-shrink: 0;",
    "}",
    "#ibara-close-btn:hover { background: rgba(255,255,255,0.12); color: #F0F0FF; }",
    "#ibara-messages {",
    "  flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px;",
    "  scrollbar-width: thin; scrollbar-color: rgba(124,58,237,0.3) transparent;",
    "}",
    "#ibara-messages::-webkit-scrollbar { width: 4px; }",
    "#ibara-messages::-webkit-scrollbar-track { background: transparent; }",
    "#ibara-messages::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 4px; }",
    ".ibara-msg { display: flex; gap: 8px; max-width: 100%; animation: ibara-slide-in 0.2s ease; }",
    ".ibara-msg.ibara-user { flex-direction: row-reverse; }",
    ".ibara-msg-avatar {",
    "  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;",
    "  background: linear-gradient(135deg, #7C3AED, #06B6D4);",
    "  display: flex; align-items: center; justify-content: center; font-size: 13px;",
    "  margin-top: 2px;",
    "}",
    ".ibara-msg-bubble {",
    "  max-width: calc(100% - 40px); padding: 10px 14px; border-radius: 16px;",
    "  font-size: 13.5px; line-height: 1.55; word-break: break-word;",
    "}",
    ".ibara-bot .ibara-msg-bubble {",
    "  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.07);",
    "  color: rgba(240,240,255,0.85); border-bottom-left-radius: 4px;",
    "}",
    ".ibara-user .ibara-msg-bubble {",
    "  background: linear-gradient(135deg, rgba(124,58,237,0.35), rgba(6,182,212,0.2));",
    "  border: 1px solid rgba(124,58,237,0.3); color: #F0F0FF; border-bottom-right-radius: 4px;",
    "}",
    "#ibara-typing {",
    "  display: flex; gap: 8px; align-items: center; padding: 0 4px;",
    "}",
    "#ibara-typing-dots { display: flex; gap: 4px; padding: 10px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; border-bottom-left-radius: 4px; }",
    ".ibara-dot {",
    "  width: 6px; height: 6px; border-radius: 50%; background: rgba(124,58,237,0.7);",
    "  animation: ibara-typing 1.4s ease-in-out infinite;",
    "}",
    ".ibara-dot:nth-child(2) { animation-delay: 0.2s; }",
    ".ibara-dot:nth-child(3) { animation-delay: 0.4s; }",
    "#ibara-input-area {",
    "  padding: 12px 14px; border-top: 1px solid rgba(255,255,255,0.06);",
    "  background: rgba(0,0,0,0.2); flex-shrink: 0;",
    "}",
    "#ibara-input-row { display: flex; gap: 8px; align-items: flex-end; }",
    "#ibara-input {",
    "  flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);",
    "  border-radius: 12px; color: #F0F0FF; font-size: 13.5px; line-height: 1.45;",
    "  padding: 10px 12px; resize: none; outline: none; font-family: inherit;",
    "  transition: border-color 0.2s; max-height: 100px; min-height: 40px; overflow-y: auto;",
    "}",
    "#ibara-input:focus { border-color: rgba(124,58,237,0.5); background: rgba(124,58,237,0.06); }",
    "#ibara-input::placeholder { color: rgba(240,240,255,0.2); }",
    "#ibara-send-btn {",
    "  width: 38px; height: 38px; border-radius: 10px; border: none; cursor: pointer;",
    "  background: linear-gradient(135deg, #7C3AED, #06B6D4);",
    "  display: flex; align-items: center; justify-content: center;",
    "  transition: transform 0.2s, opacity 0.2s; flex-shrink: 0;",
    "}",
    "#ibara-send-btn:hover:not(:disabled) { transform: scale(1.08); }",
    "#ibara-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }",
    "#ibara-powered { text-align: center; font-size: 10px; color: rgba(240,240,255,0.18); margin-top: 7px; }",
    "#ibara-powered a { color: rgba(124,58,237,0.6); text-decoration: none; }",
    "#ibara-powered a:hover { color: rgba(124,58,237,1); }",
    "@keyframes ibara-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:0.7} }",
    "@keyframes ibara-typing { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-6px);opacity:1} }",
    "@keyframes ibara-slide-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }",
    "@media (max-width: 440px) {",
    "  #ibara-chat-window {",
    "    width: calc(100vw - 20px); right: 10px; left: 10px;",
    "    bottom: 84px; height: calc(100vh - 110px); max-height: calc(100vh - 110px);",
    "    border-radius: 16px;",
    "  }",
    "  #ibara-widget-btn { bottom: 16px; right: 16px; width: 54px; height: 54px; }",
    "}",
  ].join("\n");

  function injectStyles() {
    var style = document.createElement("style");
    style.id = "ibara-widget-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }

  function createBtn() {
    var btn = document.createElement("button");
    btn.id = "ibara-widget-btn";
    btn.setAttribute("aria-label", "Open AI chat assistant");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = [
      '<div id="ibara-badge"></div>',
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" id="ibara-icon-chat">',
      '  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"',
      '    stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      '</svg>',
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" id="ibara-icon-close" style="display:none">',
      '  <path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2.5" stroke-linecap="round"/>',
      '</svg>',
    ].join("");
    btn.addEventListener("click", toggleChat);
    return btn;
  }

  function createWindow() {
    var win = document.createElement("div");
    win.id = "ibara-chat-window";
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-label", "Plyndrox Web AI Chat");
    win.innerHTML = [
      '<div id="ibara-header">',
      '  <div id="ibara-avatar">🤖</div>',
      '  <div id="ibara-header-info">',
      '    <div id="ibara-header-name">Plyndrox Web Assistant</div>',
      '    <div id="ibara-header-status">',
      '      <div id="ibara-status-dot"></div>',
      '      <span id="ibara-status-text">Online · Always here to help</span>',
      '    </div>',
      '  </div>',
      '  <button id="ibara-close-btn" aria-label="Close chat">✕</button>',
      '</div>',
      '<div id="ibara-messages" role="log" aria-live="polite"></div>',
      '<div id="ibara-input-area">',
      '  <div id="ibara-input-row">',
      '    <textarea id="ibara-input" placeholder="Type your message..." rows="1" aria-label="Message input"></textarea>',
      '    <button id="ibara-send-btn" aria-label="Send message" disabled>',
      '      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">',
      '        <path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/>',
      '      </svg>',
      '    </button>',
      '  </div>',
      '  <div id="ibara-powered">Powered by <a href="https://ibara.ai" target="_blank" rel="noopener">Plyndrox Web AI</a></div>',
      '</div>',
    ].join("");

    win.querySelector("#ibara-close-btn").addEventListener("click", closeChat);
    var input = win.querySelector("#ibara-input");
    var sendBtn = win.querySelector("#ibara-send-btn");

    input.addEventListener("input", function () {
      sendBtn.disabled = !this.value.trim();
      this.style.height = "auto";
      this.style.height = Math.min(this.scrollHeight, 100) + "px";
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) sendMessage();
      }
    });
    sendBtn.addEventListener("click", sendMessage);

    return win;
  }

  function toggleChat() {
    if (isOpen) closeChat();
    else openChat();
  }

  function openChat() {
    isOpen = true;
    var win = document.getElementById("ibara-chat-window");
    var btn = document.getElementById("ibara-widget-btn");
    var iconChat = document.getElementById("ibara-icon-chat");
    var iconClose = document.getElementById("ibara-icon-close");

    win.classList.add("ibara-open");
    btn.setAttribute("aria-expanded", "true");
    if (iconChat) iconChat.style.display = "none";
    if (iconClose) iconClose.style.display = "block";

    if (conversationHistory.length === 0) {
      loadBotInfo();
    }

    setTimeout(function () {
      var input = document.getElementById("ibara-input");
      if (input) input.focus();
    }, 300);
  }

  function closeChat() {
    isOpen = false;
    var win = document.getElementById("ibara-chat-window");
    var btn = document.getElementById("ibara-widget-btn");
    var iconChat = document.getElementById("ibara-icon-chat");
    var iconClose = document.getElementById("ibara-icon-close");

    win.classList.remove("ibara-open");
    btn.setAttribute("aria-expanded", "false");
    if (iconChat) iconChat.style.display = "block";
    if (iconClose) iconClose.style.display = "none";
  }

  function loadBotInfo() {
    fetch(API_BASE + "/api/ibara/sites/" + SITE_ID + "/bot?userId=widget")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var bot = data.bot;
        if (bot) {
          botName = bot.businessName ? bot.businessName + " AI" : "Plyndrox Web Assistant";
          botWelcome = "Hi! I'm the AI assistant for " + (bot.businessName || "this business") + ". How can I help you today? 😊";
          var nameEl = document.getElementById("ibara-header-name");
          if (nameEl) nameEl.textContent = botName;
        }
        appendMessage("bot", botWelcome);
      })
      .catch(function () {
        appendMessage("bot", botWelcome);
      });
  }

  function appendMessage(role, content) {
    var messagesEl = document.getElementById("ibara-messages");
    if (!messagesEl) return;

    var div = document.createElement("div");
    div.className = "ibara-msg ibara-" + (role === "user" ? "user" : "bot");

    if (role === "bot") {
      div.innerHTML = [
        '<div class="ibara-msg-avatar">🤖</div>',
        '<div class="ibara-msg-bubble">' + escapeHtml(content) + '</div>',
      ].join("");
    } else {
      div.innerHTML = [
        '<div class="ibara-msg-bubble">' + escapeHtml(content) + '</div>',
        '<div class="ibara-msg-avatar" style="background:rgba(255,255,255,0.1);">👤</div>',
      ].join("");
    }

    messagesEl.appendChild(div);
    scrollToBottom();
  }

  function showTyping() {
    var messagesEl = document.getElementById("ibara-messages");
    if (!messagesEl || document.getElementById("ibara-typing")) return;

    var div = document.createElement("div");
    div.id = "ibara-typing";
    div.className = "ibara-msg ibara-bot";
    div.innerHTML = [
      '<div class="ibara-msg-avatar">🤖</div>',
      '<div id="ibara-typing-dots">',
      '  <div class="ibara-dot"></div>',
      '  <div class="ibara-dot"></div>',
      '  <div class="ibara-dot"></div>',
      '</div>',
    ].join("");
    messagesEl.appendChild(div);
    scrollToBottom();
  }

  function hideTyping() {
    var t = document.getElementById("ibara-typing");
    if (t) t.remove();
  }

  function scrollToBottom() {
    var el = document.getElementById("ibara-messages");
    if (el) el.scrollTop = el.scrollHeight;
  }

  function sendMessage() {
    if (isLoading) return;
    var input = document.getElementById("ibara-input");
    var sendBtn = document.getElementById("ibara-send-btn");
    var text = input ? input.value.trim() : "";
    if (!text) return;

    appendMessage("user", text);
    conversationHistory.push({ role: "user", content: text });

    input.value = "";
    input.style.height = "auto";
    if (sendBtn) sendBtn.disabled = true;

    isLoading = true;
    showTyping();

    fetch(API_BASE + "/api/ibara/sites/" + SITE_ID + "/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        history: conversationHistory.slice(-10),
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        hideTyping();
        var reply = data.reply || "I'm sorry, I couldn't process that. Please try again.";
        appendMessage("bot", reply);
        conversationHistory.push({ role: "assistant", content: reply });
        isLoading = false;
      })
      .catch(function () {
        hideTyping();
        appendMessage("bot", "Sorry, I'm having trouble connecting. Please try again in a moment.");
        isLoading = false;
      });
  }

  function escapeHtml(text) {
    var d = document.createElement("div");
    d.appendChild(document.createTextNode(text));
    return d.innerHTML;
  }

  function init() {
    if (document.getElementById("ibara-widget-btn")) return;

    injectStyles();

    var btn = createBtn();
    var win = createWindow();

    document.body.appendChild(btn);
    document.body.appendChild(win);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
