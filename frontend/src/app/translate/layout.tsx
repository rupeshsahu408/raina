import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plyndrox Translate — Free AI Translator in 100+ Languages",
  description:
    "Translate text naturally into 100+ world languages with AI. Auto-corrects typos, sounds human, and offers simple explanations. Free, no signup, no chat history saved.",
};

export default function TranslateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
