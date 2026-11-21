import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const SYSTEM_INSTRUCTION = `You are "KrishiBot" (कृषि मित्र), an intelligent AI assistant built into the KrishiConnect agricultural management platform.
Your goals:
1. Help farmers, agri-traders, and mandi merchants use KrishiConnect features:
   - Mandi Rates (मंडी भाव): Tracking live APMC commodity prices across Indian states (Odisha, MP, UP, Maharashtra, etc.).
   - GST Invoicing: Generating GST-compliant bills with HSN codes, discounts, and UPI QR codes.
   - Logistics & Transport: Booking trucks and tracking freight costs per quintal/km.
   - Cold Storage: Reserving climate-controlled storage space for perishables (potatoes, onions, fruits).
   - Soil Health: Analyzing soil card parameters (pH, NPK, micronutrients) and recommending fertilizer dosage.
   - Weather & Radar: Rain radar, temperature, and agricultural advisory.
2. Provide practical, accurate agricultural advice (crop disease remedies, seasonal sowing, fertilizer schedule).
3. Tone: Helpful, respectful, warm, and practical.
4. Language: Reply in the same language the user asks (Hindi, Hinglish, or English). Keep answers concise and well-formatted with bullet points and emojis where helpful.`;

// Intelligent local fallback when no API key is provided or when external AI is offline
function getSmartFallbackResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("mandi") || q.includes("rate") || q.includes("bhaav") || q.includes("bhav") || q.includes("kimat") || q.includes("price")) {
    return `🌾 **Mandi Rates (मंडी भाव) KrishiConnect पर:**\n\n- आप Dashboard के **"Mandi Rates"** टैब पर जाकर पूरे भारत और ओडिशा की लाइव APMC मंडियों के भाव देख सकते हैं।\n- **ताज़ा भाव का उदाहरण (औसत):**\n  - धान (Paddy): ₹2,183 - ₹2,320 / क्विंटल\n  - गेहूँ (Wheat): ₹2,450 - ₹2,600 / क्विंटल\n  - मक्का (Maize): ₹2,050 - ₹2,200 / क्विंटल\n  - आलू (Potato): ₹1,400 - ₹1,750 / क्विंटल\n  - प्याज (Onion): ₹2,200 - ₹2,800 / क्विंटल\n\n📌 *सुझाव:* अपने ज़िले और फसल के अनुसार सटीक भाव देखने के लिए साइडबार में **Crop Rates** पर क्लिक करें।`;
  }

  if (q.includes("invoice") || q.includes("bill") || q.includes("gst") || q.includes("challan") || q.includes("rasid")) {
    return `🧾 **GST Invoice कैसे बनाएं:**\n\n1. साइडबार मेन्यू में **"Invoices"** पर क्लिक करें।\n2. **"Create New Invoice"** बटन दबाएं।\n3. ग्राहक (Customer) चुनें या नया जोड़ें।\n4. अपनी फसल/प्रोडक्ट, वज़न (क्विंटल/किलो) और भाव डालें (GST व HSN कोड अपने आप लग जाएगा)।\n5. **Save & Print** पर क्लिक करके PDF डाउनलोड करें या ग्राहक को UPI QR कोड के साथ भेजें।`;
  }

  if (q.includes("truck") || q.includes("transport") || q.includes("gadi") || q.includes("logistics") || q.includes("kiraya")) {
    return `🚜 **Transport & Logistics बुकिंग:**\n\n- KrishiConnect पर आप खेत से मंडी या वेयरहाउस तक ट्रक और पिकअप बुक कर सकते हैं।\n- **सुविधाएं:**\n  - लोड और दूरी (KM) के हिसाब से तुरंत किराया कैलकुलेशन।\n  - वेरीफाइड ड्राइवर और लाइव रूट ट्रैकिंग।\n  - बुकिंग के लिए मेन्यू में **"Transport"** सेक्शन पर जाएं।`;
  }

  if (q.includes("cold storage") || q.includes("storage") || q.includes("godown") || q.includes("warehouse")) {
    return `❄️ **Cold Storage (शीतगृह) बुकिंग:**\n\n- अपनी आलू, प्याज, फल या बीज को सुरक्षित रखने के लिए पास के कोल्ड स्टोरेज में जगह आरक्षित करें।\n- तापमान और नमी (Humidity) की रियल-टाइम मॉनिटरिंग उपलब्ध है।\n- बुकिंग के लिए **"Cold Storage"** टैब खोलें और अपनी बोरी (Bags) की संख्या दर्ज करें।`;
  }

  if (q.includes("mitti") || q.includes("soil") || q.includes("khad") || q.includes("fertilizer") || q.includes("urea") || q.includes("dap")) {
    return `🧪 **मृदा स्वास्थ्य (Soil Health) और खाद सुझाव:**\n\n- KrishiConnect का AI आपके सॉइल हेल्थ कार्ड की फोटो या पैरामीटर्स (pH, N, P, K) देखकर सही खाद की मात्रा बताता है।\n- **सामान्य सुझाव:**\n  - बुवाई से पहले प्रति एकड़ 4-5 टन गोबर की सड़ी खाद (FYM) डालें।\n  - अम्लीय (Acidic) मिट्टी में चूना (Lime) का उपयोग करें।\n  - जांच के लिए साइडबार में **"Soil Health"** पेज पर जाएं।`;
  }

  if (q.includes("weather") || q.includes("mausam") || q.includes("barish") || q.includes("rain") || q.includes("badal")) {
    return `🌦️ **मौसम और वर्षा पूर्वानुमान:**\n\n- KrishiConnect पर लाइव Doppler Radar और सेटेलाइट बादलों की गति देख सकते हैं।\n- अगले 7 दिनों का तापमान, बारिश की संभावना और हवा की गति जानने के लिए **"Weather"** पेज देखें।\n- छिड़काव (Spraying) हमेशा हवा शांत और बारिश की संभावना न होने पर ही करें।`;
  }

  if (q.includes("namaste") || q.includes("hello") || q.includes("hi") || q.includes("kaise ho") || q.includes("kya kar sakte")) {
    return `नमस्ते! 🙏 मैं **KrishiBot** हूँ — KrishiConnect का स्मार्ट कृषि सहायक।\n\nमैं आपकी इन चीज़ों में मदद कर सकता हूँ:\n- 🌾 **मंडी भाव (Mandi Rates)** चेक करना\n- 🧾 **GST Invoice & Bill** तैयार करना\n- 🚜 **ट्रक / ट्रांसपोर्ट** का किराया और बुकिंग\n- ❄️ **कोल्ड स्टोरेज** स्लॉट बुक करना\n- 🌦️ **मौसम और वर्षा** की सटीक जानकारी\n- 🧪 **मिट्टी की जांच और खाद** का सही संतुलन\n\nबताइए आज आपकी क्या सहायता करूँ?`;
  }

  return `नमस्ते! 🙏 मैं KrishiConnect का कृषि सहायक (KrishiBot) हूँ।\n\nआपके प्रश्न के संदर्भ में:\n- अगर आप **मंडी भाव**, **बिल/चालान**, **ट्रांसपोर्ट बुकिंग**, या **फसल सलाह** से जुड़ा कुछ पूछना चाहते हैं, तो कृपया विस्तार से बताएं।\n- मैं आपको तुरंत सही कदम और डेटा प्रदान करूँगा!`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];

    if (!messages.length) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const latestUserMessage = messages[messages.length - 1]?.content || "";
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();

    // If Gemini API key is available, call Google Gemini
    if (apiKey && apiKey !== "your_gemini_api_key") {
      try {
        // Prioritize verified models for this API key
        const modelNames = [
          "gemini-flash-lite-latest",
          "gemini-flash-latest",
          "gemini-2.5-flash-lite",
          "gemini-2.0-flash",
          "gemini-1.5-flash",
        ];
        let lastError: any = null;

        for (const model of modelNames) {
          try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            
            // Format previous conversation for Gemini
            const contents = [
              {
                role: "user",
                parts: [{ text: `[System Instruction: ${SYSTEM_INSTRUCTION}]` }],
              },
              {
                role: "model",
                parts: [{ text: "Understood. I will act as KrishiBot and assist with KrishiConnect and agricultural queries in Hindi/Hinglish/English." }],
              },
              ...messages.map((m) => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
              })),
            ];

            const response = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents,
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 800,
                  topP: 0.9,
                },
              }),
              signal: AbortSignal.timeout(12000),
            });

            if (response.ok) {
              const data = await response.json();
              const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (reply) {
                return NextResponse.json({
                  reply,
                  source: "gemini",
                  model,
                });
              }
            } else {
              const errText = await response.text();
              lastError = errText;
            }
          } catch (e) {
            lastError = e;
          }
        }
        console.warn("Gemini API call failed or rate-limited, switching to KrishiConnect fallback:", lastError);
      } catch (err) {
        console.warn("External AI call error:", err);
      }
    }

    // Smart context-aware fallback response
    const fallbackReply = getSmartFallbackResponse(latestUserMessage);
    return NextResponse.json({
      reply: fallbackReply,
      source: "local-assistant",
      model: "krishiconnect-rule-engine",
    });
  } catch (err: any) {
    console.error("Chat API route error:", err);
    return NextResponse.json(
      { error: "Failed to generate reply", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}
