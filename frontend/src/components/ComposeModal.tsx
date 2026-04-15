"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  KeyboardEvent as RKeyboardEvent,
} from "react";
import type { User } from "firebase/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Draft {
  id: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  bodyHtml: string;
  attachments: { name: string; size: number; type: string }[];
  savedAt: number;
}

interface ScheduledEmail {
  id: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  bodyHtml: string;
  scheduledAt: number;
  attachments: { name: string; size: number; type: string }[];
}

interface AttachmentFile {
  file: File;
  id: string;
  url: string;
}

export interface ComposeModalProps {
  user: User | null;
  apiBase: string;
  onClose: () => void;
  onSent: (folder?: string) => void;
  initialTo?: string;
  initialSubject?: string;
  initialBodyHtml?: string;
  draftId?: string;
}

// ─── Emoji sets ───────────────────────────────────────────────────────────────

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: "Smileys",
    emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","☺️","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥴","😵","💫","🤯","🤠","🥳","🥸","😎","🤓","🧐","😕","😟","🙁","☹️","😮","😯","😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖"],
  },
  {
    label: "Gestures",
    emojis: ["👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦵","🦶","👂","🦻","👃","🧠","🫀","🫁","🦷","🦴","👀","👁️","👅","👄"],
  },
  {
    label: "Animals",
    emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐝","🐛","🦋","🐌","🐞","🐜","🪲","🦟","🦗","🪳","🕷️","🦂","🐢","🐍","🦎","🦖","🦕","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈","🐊","🐅","🐆","🦓","🦍","🦧","🦣","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🦬","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐","🦌","🐕","🐩","🦮","🐕‍🦺","🐈","🐈‍⬛","🪶","🐓","🦃","🦤","🦚","🦜","🦢","🦩","🕊️","🐇","🦝","🦨","🦡","🦫","🦦","🦥","🐁","🐀","🐿️","🦔"],
  },
  {
    label: "Food",
    emojis: ["🍎","🍊","🍋","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🫒","🥑","🍆","🥦","🥬","🥒","🫑","🌶️","🫚","🧅","🧄","🥔","🍠","🍞","🥐","🥖","🫓","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🌭","🍔","🍟","🍕","🫔","🥙","🧆","🌮","🌯","🫕","🥗","🥘","🫙","🍝","🍜","🍲","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥮","🍢","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰","🥜","🍯","🧃","🥤","🧋","☕","🫖","🍵","🍺","🍻","🥂","🍷","🥃","🍸","🍹","🧉","🍾","🧊"],
  },
  {
    label: "Objects",
    emojis: ["💌","📝","📧","📨","📩","📬","📭","📮","📯","📣","📢","🔔","🔕","🔇","🔈","🔉","🔊","💬","💭","🗯️","📱","☎️","📞","📟","📠","🖨️","🖥️","💻","⌨️","🖱️","🖲️","💾","💿","📀","🎬","📷","📸","📹","🎥","📽️","🎞️","📞","📺","📻","🎙️","🎚️","🎛️","🧭","⏱️","⏲️","⏰","🕰️","⌛","⏳","📡","🔋","🔌","💡","🔦","🕯️","🪔","🧯","🛢️","💰","💴","💵","💶","💷","💸","💳","🪙","📊","📈","📉","📋","📁","📂","🗂️","📅","📆","🗒️","🗓️","📒","📓","📔","📕","📗","📘","📙","📚","📖","🔖","🏷️","💡","🔮","🪄","🧿","🎁","🎀","🎊","🎉","🎈","🎏","🎐","🧧","✉️","📪","📫","📦"],
  },
  {
    label: "Symbols",
    emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☪️","🕉️","✡️","🔯","🕎","☯️","☦️","🛐","⛎","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","🆔","⚛️","🉑","☢️","☣️","📴","📳","🈶","🈚","🈸","🈺","🈷️","✴️","🆚","💮","🉐","㊙️","㊗️","🈴","🈵","🈹","🈲","🅰️","🅱️","🆎","🆑","🅾️","🆘","❌","⭕","🛑","⛔","📛","🚫","💯","💢","♨️","🚷","🚯","🚳","🚱","🔞","📵","🔕","✅","☑️","✔️","❎","🔰","♻️","🆙","🆒","🆕","🆓","🔝","🛂","🛃","🛄","🛅","🚹","🚺","🚼","⚧","🚻","🚮","🎦","📶","🈁","🔣","ℹ️","🔤","🔡","🔠","🆖","🆗","🆙","🆒","🆕","🆓"],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function storedDrafts(): Draft[] {
  try {
    return JSON.parse(localStorage.getItem("plyndrox_drafts") || "[]");
  } catch { return []; }
}

function saveDraftToStorage(draft: Draft) {
  const drafts = storedDrafts().filter(d => d.id !== draft.id);
  drafts.unshift(draft);
  localStorage.setItem("plyndrox_drafts", JSON.stringify(drafts.slice(0, 50)));
}

function removeDraftFromStorage(id: string) {
  const drafts = storedDrafts().filter(d => d.id !== id);
  localStorage.setItem("plyndrox_drafts", JSON.stringify(drafts));
}

function storeScheduled(item: ScheduledEmail) {
  const list: ScheduledEmail[] = JSON.parse(localStorage.getItem("plyndrox_scheduled") || "[]");
  list.push(item);
  localStorage.setItem("plyndrox_scheduled", JSON.stringify(list));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToolbarBtn({
  title,
  active,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      className={`flex items-center justify-center w-7 h-7 rounded transition text-sm select-none ${
        active ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100 text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5 shrink-0" />;
}

interface RecipientChipsHandle {
  getAll: () => string[];
}

const RecipientChips = forwardRef<
  RecipientChipsHandle,
  { label: string; chips: string[]; onChange: (chips: string[]) => void; placeholder?: string }
>(function RecipientChips({ label, chips, onChange, placeholder }, ref) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    getAll: () => {
      const pending = input.trim();
      if (pending && !chips.includes(pending)) return [...chips, pending];
      return chips;
    },
  }));

  function add(value: string) {
    const v = value.trim();
    if (!v) return;
    if (!chips.includes(v)) onChange([...chips, v]);
    setInput("");
  }

  function handleKey(e: RKeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "Tab" || e.key === ",") {
      e.preventDefault();
      add(input);
    } else if (e.key === "Backspace" && !input && chips.length > 0) {
      onChange(chips.slice(0, -1));
    }
  }

  function removeChip(idx: number) {
    onChange(chips.filter((_, i) => i !== idx));
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1 min-h-[36px] px-3 py-1.5 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <span className="text-xs font-bold uppercase tracking-wide text-slate-400 w-10 shrink-0">{label}</span>
      {chips.map((chip, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-700 font-medium"
        >
          {chip}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); removeChip(i); }}
            className="text-slate-400 hover:text-red-500 transition leading-none"
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => add(input)}
        placeholder={chips.length === 0 ? (placeholder || `${label} address`) : ""}
        className="flex-1 min-w-[120px] text-sm bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
      />
    </div>
  );
});

// ─── Main compose modal ────────────────────────────────────────────────────────

export default function ComposeModal({
  user,
  apiBase,
  onClose,
  onSent,
  initialTo,
  initialSubject,
  initialBodyHtml,
  draftId: initialDraftId,
}: ComposeModalProps) {
  // ── Recipient state ──
  const [to, setTo] = useState<string[]>(initialTo ? [initialTo] : []);
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const toRef = useRef<RecipientChipsHandle>(null);
  const ccRef = useRef<RecipientChipsHandle>(null);
  const bccRef = useRef<RecipientChipsHandle>(null);

  // ── Email fields ──
  const [subject, setSubject] = useState(initialSubject || "");
  const editorRef = useRef<HTMLDivElement>(null);
  const [bodyHtml, setBodyHtml] = useState(initialBodyHtml || "");

  // ── Attachments ──
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── UI state ──
  const [showToolbar, setShowToolbar] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // ── Sending / errors ──
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ── Drafts ──
  const [draftId] = useState(initialDraftId || uid());
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Dialogs ──
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");
  const savedSelectionRef = useRef<Range | null>(null);

  const [showGifDialog, setShowGifDialog] = useState(false);
  const [gifQuery, setGifQuery] = useState("");
  const [gifResults, setGifResults] = useState<{ url: string; preview: string; title: string }[]>([]);
  const [gifLoading, setGifLoading] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiTab, setEmojiTab] = useState(0);

  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });

  const [showSignature, setShowSignature] = useState(false);
  const [signature, setSignature] = useState(
    () => typeof localStorage !== "undefined" ? (localStorage.getItem("plyndrox_signature") || "") : ""
  );

  const [confidential, setConfidential] = useState(false);
  const [fontFamily, setFontFamily] = useState("Arial, sans-serif");
  const [fontSize, setFontSize] = useState("14px");
  const [showFontPanel, setShowFontPanel] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<"text" | "bg" | null>(null);

  // ─── Paste handler — strip external styles, keep basic formatting ─────────

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");

    if (html) {
      // Allow only safe tags; strip all inline styles, class, id, data-* attrs
      // and problematic tags (script, style, table junk, etc.)
      const ALLOWED_TAGS = new Set([
        "b", "strong", "i", "em", "u", "s", "strike", "del",
        "br", "p", "div", "span", "a", "blockquote", "pre", "code",
        "h1", "h2", "h3", "h4", "h5", "h6",
        "ul", "ol", "li", "hr", "img",
      ]);

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      function cleanNode(node: Node): Node | null {
        if (node.nodeType === Node.TEXT_NODE) return node.cloneNode(true);
        if (node.nodeType !== Node.ELEMENT_NODE) return null;
        const el = node as Element;
        const tag = el.tagName.toLowerCase();

        if (!ALLOWED_TAGS.has(tag)) {
          // Replace disallowed block elements with their text content
          const frag = document.createDocumentFragment();
          el.childNodes.forEach(child => {
            const cleaned = cleanNode(child);
            if (cleaned) frag.appendChild(cleaned);
          });
          // Add a line break after block-level replacements
          const blockTags = new Set(["table", "tr", "td", "th", "thead", "tbody", "tfoot", "div"]);
          if (blockTags.has(tag)) {
            frag.appendChild(document.createElement("br"));
          }
          return frag;
        }

        const clean = document.createElement(tag) as HTMLElement;

        // Preserve only safe attributes
        if (tag === "a") {
          const href = el.getAttribute("href");
          if (href && /^https?:\/\//.test(href)) clean.setAttribute("href", href);
          clean.setAttribute("target", "_blank");
          clean.setAttribute("rel", "noopener noreferrer");
        }
        if (tag === "img") {
          const src = el.getAttribute("src");
          if (src && (src.startsWith("http") || src.startsWith("data:"))) {
            clean.setAttribute("src", src);
            clean.setAttribute("style", "max-width:100%;height:auto;display:block;margin:4px 0;");
          }
        }
        // Strip all inline styles, class, id — only keep safe structural styles
        // for tags that need them (pre, code keep their look)

        el.childNodes.forEach(child => {
          const cleaned = cleanNode(child);
          if (cleaned) clean.appendChild(cleaned);
        });
        return clean;
      }

      const frag = document.createDocumentFragment();
      doc.body.childNodes.forEach(child => {
        const cleaned = cleanNode(child);
        if (cleaned) frag.appendChild(cleaned);
      });

      // Serialize cleaned fragment to HTML string
      const tmp = document.createElement("div");
      tmp.appendChild(frag);
      const cleanHtml = tmp.innerHTML;

      document.execCommand("insertHTML", false, cleanHtml);
    } else {
      // Plain text: convert newlines to <br> and insert
      const safeText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");
      document.execCommand("insertHTML", false, safeText);
    }
    syncBody();
  }

  // ─── Exec command helper ──────────────────────────────────────────────────

  function exec(cmd: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    syncBody();
  }

  function syncBody() {
    setBodyHtml(editorRef.current?.innerHTML || "");
  }

  // ─── Format state detectors ───────────────────────────────────────────────

  const [formatState, setFormatState] = useState({
    bold: false, italic: false, underline: false, strike: false,
    ol: false, ul: false, alignLeft: false, alignCenter: false, alignRight: false,
  });

  function updateFormatState() {
    setFormatState({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strike: document.queryCommandState("strikeThrough"),
      ol: document.queryCommandState("insertOrderedList"),
      ul: document.queryCommandState("insertUnorderedList"),
      alignLeft: document.queryCommandState("justifyLeft"),
      alignCenter: document.queryCommandState("justifyCenter"),
      alignRight: document.queryCommandState("justifyRight"),
    });
  }

  // ─── Draft auto-save ──────────────────────────────────────────────────────

  const buildDraft = useCallback((): Draft => ({
    id: draftId,
    to,
    cc,
    bcc,
    subject,
    bodyHtml: editorRef.current?.innerHTML || bodyHtml,
    attachments: attachments.map(a => ({ name: a.file.name, size: a.file.size, type: a.file.type })),
    savedAt: Date.now(),
  }), [draftId, to, cc, bcc, subject, bodyHtml, attachments]);

  function saveDraft(silent = false) {
    const draft = buildDraft();
    saveDraftToStorage(draft);
    setDraftSavedAt(draft.savedAt);
    if (!silent) setSuccessMsg("Draft saved");
    setTimeout(() => setSuccessMsg(""), 2500);
  }

  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      const body = editorRef.current?.innerHTML || "";
      if (to.length || subject || body.trim()) {
        saveDraft(true);
      }
    }, 30000);
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, [to, cc, bcc, subject, attachments]);

  // ─── Initialize editor with HTML ─────────────────────────────────────────

  useEffect(() => {
    if (editorRef.current && initialBodyHtml) {
      editorRef.current.innerHTML = initialBodyHtml;
    }
  }, []);

  // ─── Signature handling ───────────────────────────────────────────────────

  function insertSignature() {
    if (!signature.trim()) return;
    const sigHtml = `<br><br><div style="color:#555;font-size:13px;border-top:1px solid #e0e0e0;padding-top:8px;margin-top:8px;">${signature.replace(/\n/g, "<br>")}</div>`;
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel) {
      sel.collapse(editorRef.current, editorRef.current?.childNodes.length ?? 0);
    }
    document.execCommand("insertHTML", false, sigHtml);
    syncBody();
  }

  // ─── Link dialog ──────────────────────────────────────────────────────────

  function openLinkDialog() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
      setLinkText(sel.toString());
    }
    setLinkUrl("https://");
    setShowLinkDialog(true);
  }

  function insertLink() {
    setShowLinkDialog(false);
    editorRef.current?.focus();
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedSelectionRef.current);
    }
    const text = linkText.trim() || linkUrl;
    if (linkText.trim()) {
      document.execCommand("insertHTML", false, `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`);
    } else {
      document.execCommand("createLink", false, linkUrl);
    }
    syncBody();
  }

  // ─── GIF search ───────────────────────────────────────────────────────────

  async function searchGifs(q: string) {
    if (!q.trim()) return;
    setGifLoading(true);
    setGifResults([]);
    try {
      const res = await fetch(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=LIVDSRZULELA&limit=20&media_filter=gif`
      );
      const data = await res.json();
      const results = (data.results || []).map((r: any) => ({
        url: r.media_formats?.gif?.url || "",
        preview: r.media_formats?.tinygif?.url || r.media_formats?.gif?.url || "",
        title: r.title || q,
      })).filter((r: { url: string }) => r.url);
      setGifResults(results);
    } catch {
      setGifResults([]);
    } finally {
      setGifLoading(false);
    }
  }

  function insertGif(url: string) {
    setShowGifDialog(false);
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, `<img src="${url}" alt="GIF" style="max-width:320px;border-radius:8px;display:block;margin:4px 0;" />`);
    syncBody();
  }

  // ─── Emoji ────────────────────────────────────────────────────────────────

  function insertEmoji(emoji: string) {
    editorRef.current?.focus();
    document.execCommand("insertText", false, emoji);
    syncBody();
  }

  // ─── File attachment ──────────────────────────────────────────────────────

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const newAtts: AttachmentFile[] = [];
    for (const file of Array.from(files)) {
      newAtts.push({ file, id: uid(), url: URL.createObjectURL(file) });
    }
    setAttachments(prev => [...prev, ...newAtts]);
  }

  function removeAttachment(id: string) {
    setAttachments(prev => {
      const att = prev.find(a => a.id === id);
      if (att) URL.revokeObjectURL(att.url);
      return prev.filter(a => a.id !== id);
    });
  }

  // ─── Inline image insertion ────────────────────────────────────────────────

  function handleInlineImages(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target?.result as string;
        editorRef.current?.focus();
        document.execCommand("insertHTML", false, `<img src="${dataUrl}" alt="${file.name}" style="max-width:100%;border-radius:6px;display:block;margin:4px 0;" />`);
        syncBody();
      };
      reader.readAsDataURL(file);
    }
  }

  // ─── Schedule send ────────────────────────────────────────────────────────

  function handleSchedule() {
    const ts = new Date(scheduleDate).getTime();
    if (isNaN(ts) || ts <= Date.now()) {
      setError("Please pick a future date and time.");
      return;
    }
    const body = editorRef.current?.innerHTML || "";
    const item: ScheduledEmail = {
      id: uid(),
      to,
      cc,
      bcc,
      subject,
      bodyHtml: body,
      scheduledAt: ts,
      attachments: attachments.map(a => ({ name: a.file.name, size: a.file.size, type: a.file.type })),
    };
    storeScheduled(item);
    if (initialDraftId) removeDraftFromStorage(initialDraftId);
    removeDraftFromStorage(draftId);
    setShowSchedule(false);
    setSuccessMsg(`Scheduled for ${new Date(ts).toLocaleString()}`);
    setTimeout(() => { onSent(); onClose(); }, 2000);
  }

  // ─── Send ─────────────────────────────────────────────────────────────────

  async function handleSend() {
    // Flush any pending typed (not-yet-chipped) recipients
    const allTo = toRef.current?.getAll() ?? to;
    const allCc = ccRef.current?.getAll() ?? cc;
    const allBcc = bccRef.current?.getAll() ?? bcc;

    if (!allTo.length) { setError("Add at least one recipient."); return; }

    // Get the raw HTML and check for real text content
    const rawHtml = editorRef.current?.innerHTML || "";
    const plainTextCheck = rawHtml
      .replace(/<br\s*\/?>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
    if (!plainTextCheck) { setError("Write a message before sending."); return; }

    setSending(true);
    setError("");
    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      let htmlBody = rawHtml;
      if (confidential) {
        htmlBody += `<br><br><div style="color:#c00;font-size:12px;padding:8px 12px;border:1px solid #c00;border-radius:6px;display:inline-block;margin-top:8px;">🔒 CONFIDENTIAL — Do not forward or share this message.</div>`;
      }

      const res = await fetch(`${apiBase}/inbox/reply/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          to: allTo.join(", "),
          cc: allCc.length ? allCc.join(", ") : undefined,
          bcc: allBcc.length ? allBcc.join(", ") : undefined,
          subject: subject.trim() || "(no subject)",
          body: htmlBody,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      removeDraftFromStorage(draftId);
      onSent("sent");
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  // ─── Discard ──────────────────────────────────────────────────────────────

  function handleDiscard() {
    removeDraftFromStorage(draftId);
    attachments.forEach(a => URL.revokeObjectURL(a.url));
    onClose();
  }

  // ─── Color palette ────────────────────────────────────────────────────────

  const TEXT_COLORS = [
    "#000000","#434343","#666666","#999999","#b7b7b7","#cccccc","#d9d9d9","#ffffff",
    "#ff0000","#ff4500","#ff9900","#ffff00","#00ff00","#00ffff","#4a86e8","#0000ff",
    "#9900ff","#ff00ff","#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc",
    "#8e7cc3","#c27ba0",
  ];

  const BG_COLORS = [
    "transparent","#ffff00","#ff9900","#ff0000","#00ff00","#00ffff","#4a86e8","#9900ff",
    "#e6b8a2","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd",
  ];

  const FONTS = [
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Times New Roman", value: "'Times New Roman', serif" },
    { label: "Courier New", value: "'Courier New', monospace" },
    { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
    { label: "Verdana", value: "Verdana, sans-serif" },
    { label: "Impact", value: "Impact, sans-serif" },
    { label: "Comic Sans MS", value: "'Comic Sans MS', cursive" },
  ];

  const SIZES = ["10px","12px","13px","14px","16px","18px","20px","24px","28px","32px","36px","48px"];

  // ─── Window sizing ────────────────────────────────────────────────────────

  const windowClass = fullscreen
    ? "fixed inset-0 z-50 flex flex-col bg-white"
    : minimized
    ? "fixed bottom-0 right-6 z-50 w-[400px] rounded-t-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden"
    : "fixed bottom-0 right-6 z-50 flex flex-col bg-white rounded-t-2xl shadow-[0_8px_50px_rgba(0,0,0,0.3)] border border-gray-200 w-[580px] max-w-[calc(100vw-24px)]";

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div className={windowClass} style={{ maxHeight: fullscreen ? "100vh" : minimized ? "auto" : "90vh" }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-4 py-3 bg-[#18163a] text-white shrink-0 cursor-default select-none"
          style={{ borderRadius: fullscreen ? 0 : "16px 16px 0 0" }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span className="text-sm font-bold">New Message</span>
            {confidential && (
              <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">CONFIDENTIAL</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Signature */}
            <button
              type="button"
              onClick={() => setShowSignature(o => !o)}
              title="Signature"
              className="p-1.5 rounded hover:bg-white/10 transition text-white/70 hover:text-white"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>
            </button>
            {/* Confidential */}
            <button
              type="button"
              onClick={() => setConfidential(o => !o)}
              title="Confidential mode"
              className={`p-1.5 rounded hover:bg-white/10 transition ${confidential ? "text-red-400" : "text-white/70 hover:text-white"}`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </button>
            {/* Minimize */}
            <button
              type="button"
              onClick={() => setMinimized(o => !o)}
              title={minimized ? "Expand" : "Minimize"}
              className="p-1.5 rounded hover:bg-white/10 transition text-white/70 hover:text-white"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            {/* Fullscreen */}
            <button
              type="button"
              onClick={() => { setFullscreen(o => !o); setMinimized(false); }}
              title={fullscreen ? "Exit full screen" : "Full screen"}
              className="p-1.5 rounded hover:bg-white/10 transition text-white/70 hover:text-white"
            >
              {fullscreen
                ? <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>
                : <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V3h4"/><path d="M21 7V3h-4"/><path d="M3 17v4h4"/><path d="M21 17v4h-4"/></svg>
              }
            </button>
            {/* Close */}
            <button
              type="button"
              onClick={handleDiscard}
              title="Close"
              className="p-1.5 rounded hover:bg-red-500/30 transition text-white/70 hover:text-white"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {minimized ? null : (
          <>
            {/* ── Recipient rows ──────────────────────────────────────────── */}
            <div className="border-b border-gray-100 shrink-0">
              <div className="border-b border-gray-100">
                <div className="flex items-start">
                  <div className="flex-1">
                    <RecipientChips ref={toRef} label="To" chips={to} onChange={setTo} placeholder="Recipients" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCcBcc(o => !o)}
                    className="px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition shrink-0 mt-1"
                  >
                    {showCcBcc ? "Hide" : "Cc Bcc"}
                  </button>
                </div>
              </div>
              {showCcBcc && (
                <>
                  <div className="border-b border-gray-100">
                    <RecipientChips ref={ccRef} label="Cc" chips={cc} onChange={setCc} />
                  </div>
                  <div className="border-b border-gray-100">
                    <RecipientChips ref={bccRef} label="Bcc" chips={bcc} onChange={setBcc} />
                  </div>
                </>
              )}
              {/* Subject */}
              <div className="flex items-center px-3 py-2 border-b border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400 w-10 shrink-0">Subj</span>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Subject"
                  className="flex-1 text-sm font-semibold text-slate-900 outline-none bg-transparent placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* ── Signature panel ─────────────────────────────────────────── */}
            {showSignature && (
              <div className="border-b border-gray-100 bg-amber-50/60 px-4 py-3 shrink-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-amber-700">Email Signature</span>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem("plyndrox_signature", signature);
                      setShowSignature(false);
                      insertSignature();
                    }}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Save & Insert
                  </button>
                </div>
                <textarea
                  value={signature}
                  onChange={e => setSignature(e.target.value)}
                  rows={3}
                  placeholder="Your name, title, contact info…"
                  className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 outline-none resize-none text-slate-700"
                />
              </div>
            )}

            {/* ── Formatting toolbar ──────────────────────────────────────── */}
            {showToolbar && (
              <div className="border-b border-gray-100 bg-gray-50/80 px-2 py-1.5 shrink-0">
                {/* Row 1 */}
                <div className="flex items-center gap-0.5 flex-wrap">
                  {/* Font family */}
                  <div className="relative">
                    <button
                      type="button"
                      onMouseDown={e => { e.preventDefault(); setShowFontPanel(o => !o); setShowColorPicker(null); }}
                      className="flex items-center gap-1 px-2 h-7 rounded text-xs text-gray-600 hover:bg-gray-100 transition"
                      title="Font"
                    >
                      <span style={{ fontFamily }}>{FONTS.find(f => f.value === fontFamily)?.label || "Font"}</span>
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    {showFontPanel && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl py-1 min-w-[180px]">
                        {FONTS.map(f => (
                          <button
                            key={f.value}
                            type="button"
                            onMouseDown={e => {
                              e.preventDefault();
                              setFontFamily(f.value);
                              exec("fontName", f.label);
                              setShowFontPanel(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition"
                            style={{ fontFamily: f.value }}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Divider />

                  {/* Font size */}
                  <select
                    value={fontSize}
                    onChange={e => {
                      setFontSize(e.target.value);
                      exec("fontSize", "3");
                      // We'll use a CSS approach
                      const el = window.getSelection()?.anchorNode?.parentElement;
                      if (el) el.style.fontSize = e.target.value;
                    }}
                    className="h-7 px-1 text-xs rounded bg-transparent text-gray-600 outline-none hover:bg-gray-100 cursor-pointer"
                    title="Font size"
                  >
                    {SIZES.map(s => (
                      <option key={s} value={s}>{s.replace("px", "")}</option>
                    ))}
                  </select>

                  <Divider />

                  <ToolbarBtn title="Bold (Ctrl+B)" active={formatState.bold} onClick={() => exec("bold")}>
                    <strong>B</strong>
                  </ToolbarBtn>
                  <ToolbarBtn title="Italic (Ctrl+I)" active={formatState.italic} onClick={() => exec("italic")}>
                    <em>I</em>
                  </ToolbarBtn>
                  <ToolbarBtn title="Underline (Ctrl+U)" active={formatState.underline} onClick={() => exec("underline")}>
                    <span style={{ textDecoration: "underline" }}>U</span>
                  </ToolbarBtn>
                  <ToolbarBtn title="Strikethrough" active={formatState.strike} onClick={() => exec("strikeThrough")}>
                    <span style={{ textDecoration: "line-through" }}>S</span>
                  </ToolbarBtn>

                  <Divider />

                  {/* Text color */}
                  <div className="relative">
                    <button
                      type="button"
                      onMouseDown={e => { e.preventDefault(); setShowColorPicker(showColorPicker === "text" ? null : "text"); setShowFontPanel(false); }}
                      title="Text color"
                      className="flex flex-col items-center justify-center w-7 h-7 rounded hover:bg-gray-100 transition"
                    >
                      <span className="text-xs font-bold leading-none" style={{ color: "#e53e3e" }}>A</span>
                      <span className="w-4 h-1 rounded-sm mt-0.5" style={{ background: "#e53e3e" }} />
                    </button>
                    {showColorPicker === "text" && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-3">
                        <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Text color</p>
                        <div className="grid grid-cols-8 gap-1">
                          {TEXT_COLORS.map(c => (
                            <button
                              key={c}
                              type="button"
                              onMouseDown={e => { e.preventDefault(); exec("foreColor", c); setShowColorPicker(null); }}
                              className="w-5 h-5 rounded border border-gray-200 hover:scale-110 transition"
                              style={{ background: c }}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Highlight color */}
                  <div className="relative">
                    <button
                      type="button"
                      onMouseDown={e => { e.preventDefault(); setShowColorPicker(showColorPicker === "bg" ? null : "bg"); setShowFontPanel(false); }}
                      title="Highlight color"
                      className="flex flex-col items-center justify-center w-7 h-7 rounded hover:bg-gray-100 transition"
                    >
                      <svg className="w-3.5 h-3.5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 3.5 21 7l-10 10-4 1 1-4 10-10.5Z"/><path d="M15 5l4 4"/><rect x="3" y="18" width="8" height="3" rx="1" fill="#facc15"/></svg>
                    </button>
                    {showColorPicker === "bg" && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-3">
                        <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Highlight color</p>
                        <div className="grid grid-cols-8 gap-1">
                          {BG_COLORS.map(c => (
                            <button
                              key={c}
                              type="button"
                              onMouseDown={e => {
                                e.preventDefault();
                                if (c === "transparent") exec("hiliteColor", "transparent");
                                else exec("hiliteColor", c);
                                setShowColorPicker(null);
                              }}
                              className="w-5 h-5 rounded border border-gray-200 hover:scale-110 transition"
                              style={{ background: c === "transparent" ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='4' height='4' fill='%23ccc'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23ccc'/%3E%3Crect x='4' width='4' height='4' fill='%23fff'/%3E%3Crect y='4' width='4' height='4' fill='%23fff'/%3E%3C/svg%3E\")" : c }}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Divider />

                  {/* Clear formatting */}
                  <ToolbarBtn title="Clear formatting" onClick={() => exec("removeFormat")}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3"/><path d="M5 20h6"/><path d="M13 4l-6 16"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="21" y1="15" x2="15" y2="21"/></svg>
                  </ToolbarBtn>
                </div>

                {/* Row 2 */}
                <div className="flex items-center gap-0.5 flex-wrap mt-1">
                  {/* Headings */}
                  <select
                    defaultValue=""
                    onChange={e => {
                      if (e.target.value) exec("formatBlock", e.target.value);
                      e.target.value = "";
                    }}
                    className="h-7 px-1 text-xs rounded bg-transparent text-gray-600 outline-none hover:bg-gray-100 cursor-pointer"
                    title="Heading"
                  >
                    <option value="" disabled>Heading</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="p">Normal text</option>
                    <option value="blockquote">Quote</option>
                    <option value="pre">Code block</option>
                  </select>

                  <Divider />

                  {/* Lists */}
                  <ToolbarBtn title="Bullet list" active={formatState.ul} onClick={() => exec("insertUnorderedList")}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>
                  </ToolbarBtn>
                  <ToolbarBtn title="Numbered list" active={formatState.ol} onClick={() => exec("insertOrderedList")}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
                  </ToolbarBtn>
                  <ToolbarBtn title="Indent" onClick={() => exec("indent")}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/><polyline points="9 8 13 12 9 16"/></svg>
                  </ToolbarBtn>
                  <ToolbarBtn title="Outdent" onClick={() => exec("outdent")}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/><polyline points="13 8 9 12 13 16"/></svg>
                  </ToolbarBtn>

                  <Divider />

                  {/* Align */}
                  <ToolbarBtn title="Align left" active={formatState.alignLeft} onClick={() => exec("justifyLeft")}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
                  </ToolbarBtn>
                  <ToolbarBtn title="Align center" active={formatState.alignCenter} onClick={() => exec("justifyCenter")}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
                  </ToolbarBtn>
                  <ToolbarBtn title="Align right" active={formatState.alignRight} onClick={() => exec("justifyRight")}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
                  </ToolbarBtn>
                  <ToolbarBtn title="Justify" onClick={() => exec("justifyFull")}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                  </ToolbarBtn>

                  <Divider />

                  {/* Link */}
                  <ToolbarBtn title="Insert link" onClick={openLinkDialog}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  </ToolbarBtn>
                  {/* Remove link */}
                  <ToolbarBtn title="Remove link" onClick={() => exec("unlink")}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  </ToolbarBtn>

                  {/* Inline image */}
                  <ToolbarBtn title="Insert photo" onClick={() => imageInputRef.current?.click()}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </ToolbarBtn>

                  {/* GIF */}
                  <ToolbarBtn title="Insert GIF" onClick={() => { setShowGifDialog(true); setShowEmojiPicker(false); }}>
                    <span className="text-[9px] font-black tracking-tight text-purple-600">GIF</span>
                  </ToolbarBtn>

                  {/* Emoji */}
                  <ToolbarBtn title="Emoji" onClick={() => { setShowEmojiPicker(o => !o); setShowGifDialog(false); }}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                  </ToolbarBtn>

                  <Divider />

                  {/* Quote */}
                  <ToolbarBtn title="Blockquote" onClick={() => exec("formatBlock", "blockquote")}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
                  </ToolbarBtn>

                  {/* Subscript / Superscript */}
                  <ToolbarBtn title="Subscript" onClick={() => exec("subscript")}>
                    <span className="text-xs">X<sub className="text-[8px]">2</sub></span>
                  </ToolbarBtn>
                  <ToolbarBtn title="Superscript" onClick={() => exec("superscript")}>
                    <span className="text-xs">X<sup className="text-[8px]">2</sup></span>
                  </ToolbarBtn>

                  {/* Horizontal rule */}
                  <ToolbarBtn title="Horizontal rule" onClick={() => exec("insertHorizontalRule")}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>
                  </ToolbarBtn>
                </div>
              </div>
            )}

            {/* ── Emoji picker ────────────────────────────────────────────── */}
            {showEmojiPicker && (
              <div className="border-b border-gray-100 bg-white shrink-0">
                <div className="flex gap-1 px-3 pt-2 overflow-x-auto">
                  {EMOJI_GROUPS.map((g, i) => (
                    <button
                      key={g.label}
                      type="button"
                      onClick={() => setEmojiTab(i)}
                      className={`shrink-0 px-2 py-1 rounded-full text-xs font-bold transition ${emojiTab === i ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-12 gap-0.5 p-2 max-h-[160px] overflow-y-auto">
                  {EMOJI_GROUPS[emojiTab].emojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onMouseDown={e => { e.preventDefault(); insertEmoji(emoji); }}
                      className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-xl transition"
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── GIF picker dialog ───────────────────────────────────────── */}
            {showGifDialog && (
              <div className="border-b border-gray-100 bg-white shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                  <svg className="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M8 12h4"/><path d="M12 8v8"/><path d="M8 8v8"/><path d="M16 8c0 0 0 8 0 8"/><path d="M16 12h-2"/></svg>
                  <input
                    type="text"
                    value={gifQuery}
                    onChange={e => setGifQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && searchGifs(gifQuery)}
                    placeholder="Search GIFs (e.g. happy, thanks, congrats)…"
                    className="flex-1 text-sm outline-none text-gray-800 placeholder:text-gray-400"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => searchGifs(gifQuery)}
                    className="px-3 py-1.5 rounded-full bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGifDialog(false)}
                    className="text-gray-400 hover:text-gray-700 transition"
                  >
                    ×
                  </button>
                </div>
                <div className="max-h-[180px] overflow-y-auto p-2">
                  {gifLoading && (
                    <div className="flex items-center justify-center py-6">
                      <div className="w-6 h-6 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin" />
                    </div>
                  )}
                  {!gifLoading && gifResults.length === 0 && gifQuery && (
                    <p className="text-center text-sm text-gray-400 py-4">No GIFs found. Try a different search.</p>
                  )}
                  {!gifLoading && gifResults.length === 0 && !gifQuery && (
                    <p className="text-center text-sm text-gray-400 py-4">Search for GIFs above, then click one to insert it.</p>
                  )}
                  {!gifLoading && gifResults.length > 0 && (
                    <div className="grid grid-cols-4 gap-1.5">
                      {gifResults.map((g, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => insertGif(g.url)}
                          className="rounded-lg overflow-hidden hover:opacity-80 transition aspect-video bg-gray-100"
                          title={g.title}
                        >
                          <img src={g.preview} alt={g.title} className="w-full h-full object-cover" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="px-3 pb-2 flex items-center gap-1">
                  <span className="text-[10px] text-gray-400">Powered by</span>
                  <span className="text-[10px] font-bold text-gray-500">Tenor</span>
                </div>
              </div>
            )}

            {/* ── Rich text editor ────────────────────────────────────────── */}
            <div
              className="flex-1 overflow-y-auto"
              onClick={() => { setShowColorPicker(null); setShowFontPanel(false); setShowEmojiPicker(false); }}
            >
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={syncBody}
                onKeyUp={updateFormatState}
                onMouseUp={updateFormatState}
                onFocus={updateFormatState}
                onPaste={handlePaste}
                data-placeholder="Write your email…"
                className="min-h-[220px] px-4 py-4 text-sm text-slate-800 outline-none leading-relaxed"
                style={{
                  fontFamily,
                  fontSize,
                }}
              />
            </div>

            {/* ── Attachments ─────────────────────────────────────────────── */}
            {attachments.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-2 flex flex-wrap gap-2 bg-gray-50/60 shrink-0">
                {attachments.map(att => (
                  <div
                    key={att.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white border border-gray-200 text-xs text-gray-700 shadow-sm"
                  >
                    {att.file.type.startsWith("image/")
                      ? <img src={att.url} alt="" className="w-4 h-4 rounded object-cover" />
                      : <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    }
                    <span className="max-w-[120px] truncate">{att.file.name}</span>
                    <span className="text-gray-400">({formatBytes(att.file.size)})</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="ml-1 text-gray-400 hover:text-red-500 transition leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── Error / success banner ──────────────────────────────────── */}
            {(error || successMsg) && (
              <div className={`shrink-0 px-4 py-2 text-sm font-medium border-t ${
                error ? "text-red-600 bg-red-50 border-red-100" : "text-emerald-700 bg-emerald-50 border-emerald-100"
              }`}>
                {error || successMsg}
              </div>
            )}

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <div className="border-t border-gray-100 px-3 py-2.5 flex items-center gap-2 bg-white shrink-0">
              {/* Send */}
              <div className="flex items-center rounded-full bg-[#5c4ff6] text-white overflow-hidden shadow-md hover:shadow-lg transition">
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending}
                  className="flex items-center gap-2 pl-4 pr-3 py-2 text-sm font-bold hover:bg-white/10 transition disabled:opacity-60"
                >
                  {sending
                    ? <div className="w-4 h-4 rounded-full border border-white/40 border-t-white animate-spin" />
                    : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></svg>
                  }
                  {sending ? "Sending…" : "Send"}
                </button>
                {/* Schedule dropdown arrow */}
                <button
                  type="button"
                  onClick={() => setShowSchedule(o => !o)}
                  title="Schedule send"
                  className="border-l border-white/20 px-2 py-2 hover:bg-white/10 transition"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                </button>
              </div>

              {/* Format toggle */}
              <button
                type="button"
                onClick={() => setShowToolbar(o => !o)}
                title={showToolbar ? "Hide formatting" : "Show formatting"}
                className={`p-2 rounded-full transition ${showToolbar ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
              </button>

              {/* Attach file */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </button>

              {/* Inline image */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                title="Insert image"
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </button>

              {/* GIF */}
              <button
                type="button"
                onClick={() => { setShowGifDialog(o => !o); setShowEmojiPicker(false); }}
                title="Insert GIF"
                className={`p-2 rounded-full transition text-xs font-black ${showGifDialog ? "bg-purple-50 text-purple-600" : "text-gray-500 hover:bg-gray-100"}`}
              >
                GIF
              </button>

              {/* Emoji */}
              <button
                type="button"
                onClick={() => { setShowEmojiPicker(o => !o); setShowGifDialog(false); }}
                title="Emoji"
                className={`p-2 rounded-full transition ${showEmojiPicker ? "bg-yellow-50 text-yellow-600" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </button>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Draft save */}
              <button
                type="button"
                onClick={() => saveDraft(false)}
                title="Save draft"
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              </button>

              {/* Discard */}
              <button
                type="button"
                onClick={handleDiscard}
                title="Discard draft"
                className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </button>
            </div>

            {/* ── Schedule panel ──────────────────────────────────────────── */}
            {showSchedule && (
              <div className="border-t border-indigo-100 bg-indigo-50 px-4 py-3 shrink-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <svg className="w-4 h-4 text-indigo-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span className="text-sm font-bold text-indigo-800">Schedule send</span>
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                    min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                    className="flex-1 min-w-[200px] text-sm border border-indigo-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleSchedule}
                    className="px-4 py-1.5 rounded-full bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition"
                  >
                    Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSchedule(false)}
                    className="text-indigo-400 hover:text-indigo-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Draft saved indicator */}
            {draftSavedAt && (
              <div className="border-t border-gray-100 px-4 py-1.5 text-[11px] text-gray-400 bg-gray-50 shrink-0">
                Draft saved {new Date(draftSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Link dialog (modal) ───────────────────────────────────────────────── */}
      {showLinkDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-[380px] max-w-[90vw]">
            <h3 className="text-base font-bold text-gray-800 mb-4">Insert link</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Display text (optional)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={e => setLinkText(e.target.value)}
                  placeholder="Link text shown to reader"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button
                type="button"
                onClick={() => setShowLinkDialog(false)}
                className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertLink}
                disabled={!linkUrl || linkUrl === "https://"}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
              >
                Insert link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleInlineImages(e.target.files)}
      />

      {/* ── Placeholder CSS ───────────────────────────────────────────────────── */}
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
        [contenteditable] blockquote {
          margin: 8px 0 8px 12px;
          padding-left: 12px;
          border-left: 3px solid #dadce0;
          color: #5f6368;
        }
        [contenteditable] pre {
          background: #f5f5f5;
          border-radius: 6px;
          padding: 8px 12px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          white-space: pre-wrap;
        }
        [contenteditable] a {
          color: #4f46e5;
          text-decoration: underline;
        }
        [contenteditable] h1 { font-size: 1.6em; font-weight: 800; margin: 8px 0; }
        [contenteditable] h2 { font-size: 1.3em; font-weight: 700; margin: 6px 0; }
        [contenteditable] h3 { font-size: 1.1em; font-weight: 700; margin: 4px 0; }
        [contenteditable] ul { list-style: disc; padding-left: 1.5em; margin: 4px 0; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.5em; margin: 4px 0; }
        [contenteditable] hr { border: 0; border-top: 1px solid #e8eaed; margin: 12px 0; }
      `}</style>
    </>
  );
}
