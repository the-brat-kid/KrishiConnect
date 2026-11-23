"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Bot,
  X,
  Send,
  RotateCcw,
  Sparkles,
  ChevronDown,
  User,
  MessageCircle,
} from "lucide-react";
import { useLanguage, LanguageCode } from "@/lib/language-context";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

interface LanguageData {
  popupGreeting: string;
  popupSubtext: string;
  botTitle: string;
  onlineStatus: string;
  placeholder: string;
  initialMessage: string;
  chips: { label: string; query: string }[];
}

const LOCALIZED_DATA: Record<string, LanguageData> = {
  hi: {
    popupGreeting: "KrishiBot",
    popupSubtext: "कृषि सहायता",
    botTitle: "KrishiBot",
    onlineStatus: "Online",
    placeholder: "सवाल पूछें...",
    initialMessage: "नमस्ते! मैं आपकी क्या मदद कर सकता हूँ?",
    chips: [
      { label: "Mandi Rates", query: "आज के ताज़ा मंडी भाव क्या हैं?" },
      { label: "Invoices", query: "KrishiConnect में GST invoice कैसे बनाएं?" },
      { label: "Transport", query: "फसल ट्रांसपोर्ट के लिए ट्रक कैसे बुक करें?" },
      { label: "Weather", query: "आज का मौसम और बारिश का पूर्वानुमान क्या है?" },
      { label: "Soil Health", query: "मिट्टी परीक्षण और खाद की सलाह बताएं" },
    ],
  },
  en: {
    popupGreeting: "KrishiBot",
    popupSubtext: "Farm Intelligence",
    botTitle: "KrishiBot",
    onlineStatus: "Online",
    placeholder: "Ask anything...",
    initialMessage: "Hello! How can I help you today?",
    chips: [
      { label: "Mandi Rates", query: "Show today's latest APMC mandi rates and crop prices" },
      { label: "Invoices", query: "How to create a GST invoice in KrishiConnect?" },
      { label: "Transport", query: "How do I calculate freight and book transport?" },
      { label: "Weather", query: "What is the weather radar and rainfall forecast?" },
      { label: "Soil Health", query: "How can I analyze soil health and fertilizer dosage?" },
    ],
  },
  or: {
    popupGreeting: "KrishiBot",
    popupSubtext: "କୃଷି ସହାୟତା",
    botTitle: "KrishiBot",
    onlineStatus: "Online",
    placeholder: "ଯାହା ବି ପଚାରନ୍ତୁ...",
    initialMessage: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
    chips: [
      { label: "Mandi Rates", query: "ଆଜିର ଲାଇଭ୍ ମଣ୍ଡି ଦର କେତେ?" },
      { label: "Invoices", query: "KrishiConnect ରେ GST ଇନଭଏସ୍ କିପରି ତିଆରି କରିବି?" },
      { label: "Transport", query: "ଫସଲ ପାଇଁ ଟ୍ରକ୍ କିପରି ବୁକ୍ କରିବି?" },
      { label: "Weather", query: "ଆଜିର ପାଣିପାଗ ପୂର୍ବାନୁମାନ କ'ଣ?" },
      { label: "Soil Health", query: "ମାଟି ପରୀକ୍ଷା ଓ ଉପଯୁକ୍ତ ସାର ସୁପାରିଶ କ'ଣ?" },
    ],
  },
  mr: {
    popupGreeting: "KrishiBot",
    popupSubtext: "मला काहीही विचारा!",
    botTitle: "KrishiBot",
    onlineStatus: "Online",
    placeholder: "काहीही विचारा...",
    initialMessage: "नमस्कार! मी तुम्हाला कशी मदत करू शकतो?",
    chips: [
      { label: "Mandi", query: "आजचे थेट APMC बाजारभाव काय आहेत?" },
      { label: "Invoices", query: "नवीन GST बिल कसे तयार करावे?" },
      { label: "Transport", query: "मालाच्या वाहतुकीसाठी ट्रक कसा बुक करावा?" },
      { label: "Weather", query: "आजचे हवामान व पावसाचा अंदाज काय आहे?" },
      { label: "Soil", query: "माती परीक्षण व योग्य खत नियोजनाबद्दल सांगा" },
    ],
  },
  pa: {
    popupGreeting: "KrishiBot",
    popupSubtext: "ਮੈਨੂੰ ਕੁਝ ਵੀ ਪੁੱਛੋ!",
    botTitle: "KrishiBot",
    onlineStatus: "Online",
    placeholder: "ਕੁਝ ਵੀ ਪੁੱਛੋ...",
    initialMessage: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
    chips: [
      { label: "Mandi", query: "ਅੱਜ ਦੇ ਤਾਜ਼ਾ ਮੰਡੀ ਭਾਅ ਕੀ ਹਨ?" },
      { label: "Invoices", query: "GST ਬਿੱਲ ਕਿਵੇਂ ਬਣਾਈਏ?" },
      { label: "Transport", query: "ਫ਼ਸਲ ਢੋਣ ਲਈ ਟਰੱਕ ਕਿਵੇਂ ਬੁੱਕ ਕਰੀਏ?" },
      { label: "Weather", query: "ਅੱਜ ਦੇ ਮੌਸਮ ਦਾ ਕੀ ਅਨੁਮਾਨ ਹੈ?" },
      { label: "Soil", query: "ਮਿੱਟੀ ਦੀ ਜਾਂਚ ਅਤੇ ਸਹੀ ਖਾਦ ਦੀ ਜਾਣਕਾਰੀ ਦਿਓ" },
    ],
  },
  gu: {
    popupGreeting: "KrishiBot",
    popupSubtext: "મને કંઈપણ પૂછો!",
    botTitle: "KrishiBot",
    onlineStatus: "Online",
    placeholder: "કંઈપણ પૂછો...",
    initialMessage: "નમસ્તે! હું તમને કેવી રીતે મદદ કરી શકું?",
    chips: [
      { label: "Mandi", query: "આજના માર્કેટ યાર્ડ ભાવ જણાવો" },
      { label: "Invoices", query: "નવું GST બિલ કેવી રીતે બનાવવું?" },
      { label: "Transport", query: "ટ્રાન્સપોર્ટ માટે ટ્રક કેવી રીતે બુક કરવો?" },
      { label: "Weather", query: "આજની હવામાન આગાહી શું છે?" },
      { label: "Soil", query: "જમીન ચકાસણી અને ખાતરનું યોગ્ય પ્રમાણ જણાવો" },
    ],
  },
  bn: {
    popupGreeting: "KrishiBot",
    popupSubtext: "আমাকে যেকোনো প্রশ্ন করুন!",
    botTitle: "KrishiBot",
    onlineStatus: "Online",
    placeholder: "যেকোনো প্রশ্ন করুন...",
    initialMessage: "নমস্কার! আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
    chips: [
      { label: "Mandi", query: "আজকের লাইভ মণ্ডির দর কত?" },
      { label: "Invoices", query: "নতুন GST চালান কীভাবে তৈরি করবেন?" },
      { label: "Transport", query: "ফসল পরিবহনের ট্রাক কীভাবে বুক করবেন?" },
      { label: "Weather", query: "আজকের আবহাওয়ার পূর্বাভাস কী?" },
      { label: "Soil", query: "মাটি পরীক্ষা এবং সারের ডোজ সম্পর্কে বলুন" },
    ],
  },
  ta: {
    popupGreeting: "KrishiBot",
    popupSubtext: "என்னிடம் எதையும் கேளுங்கள்!",
    botTitle: "KrishiBot",
    onlineStatus: "Online",
    placeholder: "எதையும் கேட்கவும்...",
    initialMessage: "வணக்கம்! நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    chips: [
      { label: "Mandi", query: "இன்றைய சந்தை விலைகள் என்ன?" },
      { label: "Invoices", query: "புதிய GST பில் தயாரிப்பது எப்படி?" },
      { label: "Transport", query: "போக்குவரத்து லாரி முன்பதிவு செய்வது எப்படி?" },
      { label: "Weather", query: "இன்றைய வானிலை முன்னறிவிப்பு என்ன?" },
      { label: "Soil", query: "மண் பரிசோதனை மற்றும் உர அளவு என்ன?" },
    ],
  },
  te: {
    popupGreeting: "KrishiBot",
    popupSubtext: "నన్ను ఏదైనా అడగండి!",
    botTitle: "KrishiBot",
    onlineStatus: "Online",
    placeholder: "ఏదైనా అడగండి...",
    initialMessage: "నమస్కారం! నేను మీకు ఎలా సహాయపడగలను?",
    chips: [
      { label: "Mandi", query: "ఈరోజు మార్కెట్ ధరలు ఏమిటి?" },
      { label: "Invoices", query: "కొత్త GST బిల్లు ఎలా తయారు చేయాలి?" },
      { label: "Transport", query: "ట్రక్ రవాణా ఎలా బుక్ చేసుకోవాలి?" },
      { label: "Weather", query: "ఈరోజు వాతావరణ సమాచారం ఏమిటి?" },
      { label: "Soil", query: "నేల పరీక్ష మరియు ఎరువుల సిఫార్సులు ఏమిటి?" },
    ],
  },
  kn: {
    popupGreeting: "KrishiBot",
    popupSubtext: "ನನ್ನನ್ನು ಏನಾದರೂ ಕೇಳಿ!",
    botTitle: "KrishiBot",
    onlineStatus: "Online",
    placeholder: "ಏನಾದರೂ ಕೇಳಿ...",
    initialMessage: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    chips: [
      { label: "Mandi", query: "ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ದರಗಳು ತಿಳಿಸಿ" },
      { label: "Invoices", query: "ಹೊಸ GST ಬಿಲ್ ಹೇಗೆ ರಚಿಸುವುದು?" },
      { label: "Transport", query: "ಸಾರಿಗೆ ಟ್ರಕ್ ಹೇಗೆ ಬುಕ್ ಮಾಡುವುದು?" },
      { label: "Weather", query: "ಇಂದಿನ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಏನು?" },
      { label: "Soil", query: "ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮತ್ತು ರಸಗೊಬ್ಬರ ಮಾಹಿತಿ ತಿಳಿಸಿ" },
    ],
  },
  ml: {
    popupGreeting: "KrishiBot",
    popupSubtext: "എന്നോട് എന്തും ചോദിക്കാം!",
    botTitle: "KrishiBot",
    onlineStatus: "Online",
    placeholder: "എന്തും ചോദിക്കുക...",
    initialMessage: "നമസ്കാരം! എനിക്ക് എങ്ങനെ സഹായിക്കാനാകും?",
    chips: [
      { label: "Mandi", query: "ഇന്നത്തെ വിപണി നിരക്കുകൾ എന്തൊക്കെയാണ്?" },
      { label: "Invoices", query: "GST ബിൽ എങ്ങനെ ഉണ്ടാക്കാം?" },
      { label: "Transport", query: "ട്രക്ക് എങ്ങനെ ബുക്ക് ചെയ്യാം?" },
      { label: "Weather", query: "ഇന്നത്തെ കാലാവസ്ഥ എന്താണ്?" },
      { label: "Soil", query: "മണ്ണ് പരിശോധനയും വളം ശുപാർശകളും എന്തൊക്കെയാണ്?" },
    ],
  },
};

export function KrishiChatbot() {
  const { language } = useLanguage();
  const currentLang: LanguageCode = language || "hi";

  const langData = useMemo(() => {
    return LOCALIZED_DATA[currentLang] || LOCALIZED_DATA.hi;
  }, [currentLang]);

  const [isOpen, setIsOpen] = useState(false);
  const [showGreetingPopup, setShowGreetingPopup] = useState(true);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-lang",
      role: "assistant",
      content: langData.initialMessage,
      time: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update initial message when user changes language
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [
          {
            id: "initial-lang-" + currentLang,
            role: "assistant",
            content: langData.initialMessage,
            time: "Just now",
          },
        ];
      }
      return prev;
    });
  }, [currentLang, langData.initialMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setShowGreetingPopup(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setShowGreetingPopup(false);

    const userMsg: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: currentLang,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const botMsg: Message = {
        id: "assistant-" + Date.now(),
        role: "assistant",
        content: data.reply || "माफ़ कीजिए, कोई उत्तर प्राप्त नहीं हुआ। कृपया पुनः प्रयास करें।",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chatbot request failed:", err);
      const errorMsg: Message = {
        id: "error-" + Date.now(),
        role: "assistant",
        content:
          "क्षमा करें! सर्वर से कनेक्ट करने में दिक्कत आ रही है। आप कुछ समय बाद पूछ सकते हैं या नीचे दिए गए क्विक ऑप्शन्स चुन सकते हैं।",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: "initial-reset-" + Date.now(),
        role: "assistant",
        content: langData.initialMessage,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Rich Markdown renderer for clean headers, lists, code blocks, bold text and math
  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          // close code block
          elements.push(
            <pre
              key={"code-" + idx}
              className="p-2.5 my-1.5 rounded-xl bg-black/60 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] overflow-x-auto"
            >
              <code>{codeBuffer.join("\n")}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Headers (### Heading)
      if (line.startsWith("### ")) {
        elements.push(
          <h4 key={idx} className="font-bold text-emerald-300 mt-2 mb-1 text-[13px]">
            {line.replace("### ", "")}
          </h4>
        );
        return;
      }
      if (line.startsWith("## ")) {
        elements.push(
          <h3 key={idx} className="font-bold text-emerald-200 mt-2.5 mb-1 text-[14px]">
            {line.replace("## ", "")}
          </h3>
        );
        return;
      }

      // Bold text & inline code processing
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-semibold text-emerald-300">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={pIdx}
              className="px-1 py-0.5 rounded bg-black/40 text-emerald-300 font-mono text-[11px] border border-emerald-500/20"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      // Bullet lists
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        elements.push(
          <div key={idx} className="flex items-start gap-1.5 my-0.5 pl-1">
            <span className="text-emerald-400 font-bold shrink-0">•</span>
            <span>{renderedParts}</span>
          </div>
        );
        return;
      }

      // Numbered lists (1. , 2. )
      const numMatch = line.match(/^\s*(\d+)\.\s+(.*)/);
      if (numMatch) {
        elements.push(
          <div key={idx} className="flex items-start gap-1.5 my-0.5 pl-1">
            <span className="text-emerald-400 font-semibold shrink-0">{numMatch[1]}.</span>
            <span>{renderedParts}</span>
          </div>
        );
        return;
      }

      // Regular line
      elements.push(
        <p key={idx} className={line.trim() === "" ? "h-2" : "my-0.5 leading-relaxed"}>
          {renderedParts}
        </p>
      );
    });

    return elements;
  };

  return (
    <aside
      aria-label="Krishi Support Desk"
      className="fixed bottom-28 md:bottom-24 right-4 md:right-6 z-50 flex flex-col items-end select-none pointer-events-auto"
    >
      {/* 1. Greeting Speech Bubble Popup on Dashboard Open (Liquid Glass) */}
      {showGreetingPopup && !isOpen && (
        <div
          role="status"
          aria-live="polite"
          className="mb-3 max-w-[270px] sm:max-w-[310px] p-3.5 rounded-2xl liquid-glass text-white shadow-2xl relative animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-300 cursor-pointer group"
          onClick={() => {
            setIsOpen(true);
            setShowGreetingPopup(false);
          }}
          style={{
            background:
              "linear-gradient(135deg, rgba(16, 28, 22, 0.88) 0%, rgba(10, 18, 14, 0.94) 100%)",
            backdropFilter: "blur(28px) saturate(200%)",
            WebkitBackdropFilter: "blur(28px) saturate(200%)",
            border: "1px solid rgba(52, 211, 153, 0.4)",
            boxShadow:
              "inset 0 1px 2px rgba(255, 255, 255, 0.45), 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.25)",
          }}
        >
          {/* Close button for popup */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowGreetingPopup(false);
            }}
            title="Dismiss"
            className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#141b17] border border-white/20 text-zinc-300 hover:text-white flex items-center justify-center text-xs shadow-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-start gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 shrink-0 mt-0.5">
              <Bot className="w-4 h-4 animate-bounce" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-300">
                <span>{langData.popupGreeting}</span>
                <Sparkles className="w-3 h-3 text-amber-400 inline" />
              </div>
              <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">
                {langData.popupSubtext}
              </p>
            </div>
          </div>

          {/* Liquid Glass Speech Bubble Pointer pointing to the Robot Icon */}
          <div
            className="absolute -bottom-2 right-6 w-3.5 h-3.5 rotate-45 border-r border-b border-emerald-400/40 bg-[#0d1612]"
            style={{
              backdropFilter: "blur(20px)",
            }}
          />
        </div>
      )}

      {/* 2. Main Chat Window (Liquid Glass) */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="krishibot-heading"
          className="w-[calc(100vw-2rem)] sm:w-[390px] h-[520px] max-h-[68vh] sm:max-h-[72vh] flex flex-col rounded-3xl text-white overflow-hidden mb-3 animate-in fade-in zoom-in-95 slide-in-from-bottom-5 duration-200 select-text"
          style={{
            background:
              "linear-gradient(160deg, rgba(14, 22, 18, 0.88) 0%, rgba(9, 14, 12, 0.94) 100%)",
            backdropFilter: "blur(32px) saturate(210%)",
            WebkitBackdropFilter: "blur(32px) saturate(210%)",
            border: "1px solid rgba(52, 211, 153, 0.35)",
            boxShadow:
              "inset 0 1.5px 2px rgba(255, 255, 255, 0.4), inset 0 -1px 2px rgba(0, 0, 0, 0.6), 0 20px 50px rgba(0, 0, 0, 0.75), 0 0 28px rgba(16, 185, 129, 0.2)",
          }}
        >
          {/* Header with Liquid Glass Gradient */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-emerald-500/25 select-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(20, 122, 77, 0.35) 0%, rgba(20, 122, 77, 0.12) 100%)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 shadow-inner">
                <Bot className="w-5 h-5 animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0d1612] ring-1 ring-emerald-500/50" />
              </div>
              <div>
                <h2
                  id="krishibot-heading"
                  className="text-sm font-bold tracking-wide text-white flex items-center gap-1.5"
                >
                  {langData.botTitle}
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300/80">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{langData.onlineStatus}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                title="Clear conversation"
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize chatbot"
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Suggestion Chips (Liquid Glass Badges) */}
          <div className="px-3 py-2 bg-black/30 border-b border-white/5 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
            {langData.chips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.query)}
                disabled={isLoading}
                className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full badge-liquid-glass-emerald transition-all hover:scale-[1.03] cursor-pointer disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs sm:text-[13px] scroll-smooth">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-md ${
                    m.role === "user"
                      ? "btn-liquid-glass-primary text-white rounded-br-xs"
                      : "liquid-glass text-zinc-100 rounded-bl-xs"
                  }`}
                  style={
                    m.role === "assistant"
                      ? {
                          background:
                            "linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 100%)",
                          border: "1px solid rgba(255, 255, 255, 0.14)",
                        }
                      : undefined
                  }
                >
                  <div className="leading-relaxed">{renderFormattedText(m.content)}</div>
                  <div
                    className={`text-[10px] mt-1 text-right ${
                      m.role === "user" ? "text-emerald-100/70" : "text-zinc-400"
                    }`}
                  >
                    {m.time}
                  </div>
                </div>

                {m.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-xs text-zinc-400">
                <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="liquid-glass rounded-2xl px-3.5 py-2 flex items-center gap-1.5 text-emerald-300">
                  <span>Thinking...</span>
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer with Liquid Glass styling */}
          <div className="p-2.5 bg-black/40 border-t border-emerald-500/20 backdrop-blur-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 rounded-xl px-3 py-1.5 transition-all liquid-glass focus-within:border-emerald-400/70"
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={langData.placeholder}
                disabled={isLoading}
                className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-zinc-400 outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="btn-liquid-glass-primary p-1.5 rounded-lg text-white disabled:opacity-40 transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400 px-1">
              <span>KrishiBot</span>
              <span className="text-emerald-400/80 font-medium">Mandi &amp; Farm Desk</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Floating Robot Trigger Button (Liquid Glass Primary) */}
      <button
        onClick={() => {
          setIsOpen((prev) => !prev);
          setShowGreetingPopup(false);
        }}
        aria-label="Toggle Krishi Support Desk"
        className="group relative flex items-center justify-center w-14 h-14 rounded-2xl btn-liquid-glass-primary text-white cursor-pointer select-none"
      >
        {/* Pulsing ring aura */}
        <span className="absolute -inset-1 rounded-2xl bg-emerald-400/30 blur-sm group-hover:bg-emerald-400/50 transition-all animate-pulse pointer-events-none" />

        {/* Robot Icon or Close */}
        {isOpen ? (
          <X className="relative z-10 w-7 h-7 text-white transition-transform duration-200" />
        ) : (
          <div className="relative z-10 flex items-center justify-center">
            <Bot className="w-7 h-7 text-white drop-shadow-md group-hover:rotate-6 transition-transform duration-200" />
            {/* Live Green Status Dot */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-300 rounded-full border-2 border-emerald-900 shadow-sm">
              <span className="absolute inset-0 rounded-full bg-emerald-300 animate-ping opacity-75" />
            </span>
          </div>
        )}

        {/* Floating tooltip label (Desktop only) */}
        {!isOpen && !showGreetingPopup && (
          <div className="hidden md:flex absolute right-16 px-3 py-1.5 rounded-xl liquid-glass text-emerald-200 text-xs font-semibold whitespace-nowrap shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{langData.botTitle}</span>
          </div>
        )}
      </button>
    </aside>
  );
}
