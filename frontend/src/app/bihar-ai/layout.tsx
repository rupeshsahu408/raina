import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd, productAppJsonLd, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const biharFaqs = [
  {
    question: "क्या Bihar AI मुफ्त है?",
    answer:
      "हाँ, Bihar AI पूरी तरह से मुफ्त है। बिहार के सभी लोगों के लिए हमेशा मुफ्त रहेगा — कोई सब्सक्रिप्शन या छिपा हुआ शुल्क नहीं।",
  },
  {
    question: "Bihar AI किन भाषाओं में बात कर सकता है?",
    answer:
      "Bihar AI हिंदी, भोजपुरी, मैथिली, मगही और अंग्रेज़ी में बातचीत कर सकता है, ताकि बिहार का हर व्यक्ति अपनी भाषा में जवाब पा सके।",
  },
  {
    question: "What kind of questions can Bihar AI answer?",
    answer:
      "Bihar AI helps with Bihar government schemes, jobs, education, scholarships, agriculture advice, train schedules, local culture, and day-to-day questions.",
  },
];

export const metadata: Metadata = buildMetadata({
  title: "Bihar AI — Regional AI Assistant for Bihar in Hindi & Bhojpuri",
  description:
    "Bihar AI is the first AI assistant built for Bihar — fluent in Hindi, Bhojpuri, Maithili, and Magahi. Get answers about local schemes, jobs, education, agriculture, and culture.",
  path: "/bihar-ai",
  keywords: [
    "Bihar AI",
    "Hindi AI assistant",
    "Bhojpuri AI",
    "Maithili AI",
    "regional AI India",
    "AI for Bihar",
    "AI in Hindi",
    "Bihar government schemes AI",
  ],
});

export default function BiharAILayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-breadcrumb-bihar"
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Bihar AI", url: "/bihar-ai" },
        ])}
      />
      <JsonLd id="ld-faq-bihar" data={faqJsonLd(biharFaqs)} />
      <JsonLd
        id="ld-app-bihar"
        data={productAppJsonLd({
          id: "bihar-ai",
          name: "Bihar AI — Plyndrox Regional AI",
          url: "/bihar-ai",
          description:
            "First AI assistant built for Bihar — fluent in Hindi, Bhojpuri, Maithili, and Magahi. Answers about local schemes, jobs, education, agriculture, and culture.",
          subCategory: "Regional Indian AI",
          inLanguage: ["hi", "bho", "mai", "mag", "en"],
          features: [
            "Conversations in Hindi, Bhojpuri, Maithili, Magahi",
            "Bihar government scheme lookup",
            "Local jobs and skill information",
            "Agriculture advice for Bihar farmers",
            "Education and scholarship info",
            "Cultural and travel guidance",
          ],
          rating: { value: "4.9", count: "521" },
        })}
      />
      {children}
    </>
  );
}
