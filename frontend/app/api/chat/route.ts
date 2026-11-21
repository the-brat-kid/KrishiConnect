import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
  hi: "Hindi (हिन्दी)",
  en: "English",
  or: "Odia (ଓଡ଼ିଆ)",
  mr: "Marathi (मराठी)",
  pa: "Punjabi (ਪੰਜਾਬੀ)",
  gu: "Gujarati (ગુજરાતી)",
  bn: "Bengali (বাংলা)",
  ta: "Tamil (தமிழ்)",
  te: "Telugu (తెలుగు)",
  kn: "Kannada (ಕನ್ನಡ)",
  ml: "Malayalam (മലയാളം)",
};

function getSmartFallbackResponse(query: string, lang: string = "hi"): string {
  const q = query.toLowerCase();

  // English fallback responses
  if (lang === "en") {
    if (q.includes("mandi") || q.includes("rate") || q.includes("price") || q.includes("market")) {
      return `🌾 **Mandi Rates on KrishiConnect:**\n\n- Visit the **"Crop Rates"** tab in the sidebar to view live APMC mandi prices across India.\n- **Sample Live Benchmark Rates:**\n  - Paddy (Dhan): ₹2,183 - ₹2,320 / quintal\n  - Wheat (Gehun): ₹2,450 - ₹2,600 / quintal\n  - Maize (Makka): ₹2,050 - ₹2,200 / quintal\n  - Potato (Aaloo): ₹1,400 - ₹1,750 / quintal\n  - Onion (Pyaz): ₹2,200 - ₹2,800 / quintal\n\n💡 *Tip:* Filter by state and district for exact local market arrivals.`;
    }
    if (q.includes("invoice") || q.includes("bill") || q.includes("gst")) {
      return `🧾 **How to Create a GST Invoice:**\n\n1. Click on **"Invoices"** in the sidebar menu.\n2. Tap **"Create New Invoice"**.\n3. Choose or add a customer.\n4. Add items with weight (quintal/kg) and unit rate — GST and HSN codes are calculated automatically.\n5. Click **Save & Print** to download PDF with dynamic UPI QR code.`;
    }
    if (q.includes("truck") || q.includes("transport") || q.includes("logistics")) {
      return `🚜 **Logistics & Truck Booking:**\n\n- Connect farm produce directly to mandis or warehouses.\n- Real-time freight estimation based on payload and distance.\n- Head over to the **"Transportation"** tab to calculate rates and book verified drivers.`;
    }
    if (q.includes("storage") || q.includes("cold storage") || q.includes("warehouse")) {
      return `❄️ **Cold Storage Booking:**\n\n- Reserve climate-controlled chambers for potatoes, onions, seeds, and perishables.\n- Check live capacity and book storage slots under the **"Cold Storage"** tab.`;
    }
    if (q.includes("soil") || q.includes("fertilizer") || q.includes("urea") || q.includes("dap")) {
      return `🧪 **Soil Health Advisory:**\n\n- Upload or enter your Soil Card test values (pH, N-P-K, micronutrients) under **"Soil Health"**.\n- Get customized fertilizer dosage and organic manuring schedules instantly.`;
    }
    return `Hello! 🙏 I am **KrishiBot** — KrishiConnect's AI Assistant.\n\nI can help you with:\n- 🌾 Live APMC Mandi Rates\n- 🧾 Instant GST Billing & PDF Invoices\n- 🚜 Freight Transportation & Truck Booking\n- ❄️ Cold Storage Reservations\n- 🌦️ Weather & Rainfall Forecasts\n- 🧪 Soil Health & Fertilizer Recommendations\n\nHow can I help you today?`;
  }

  // Odia fallback responses
  if (lang === "or") {
    if (q.includes("mandi") || q.includes("rate") || q.includes("দর") || q.includes("bhav") || q.includes("bhaav")) {
      return `🌾 **KrishiConnect ରେ ମଣ୍ଡି ଦର (Mandi Rates):**\n\n- ଓଡ଼ିଶା ତଥା ସମଗ୍ର ଭାରତର ଲାଇଭ୍ APMC ମଣ୍ଡି ଦର ଦେଖିବାକୁ ସାଇଡବାର୍ ର **"Crop Rates"** ଟ୍ୟାବ୍ କୁ ଯାଆନ୍ତୁ।\n- **ଆଜିର ମୁଖ୍ୟ ଫସଲ ଦର (ହାରାହାରି):**\n  - ଧାନ (Paddy): ₹୨,୧୮୩ - ₹୨,୩୨୦ / କ୍ୱିଣ୍ଟାଲ\n  - ଗହମ (Wheat): ₹୨,୪୫୦ - ₹୨,୬୦୦ / କ୍ୱିଣ୍ଟାଲ\n  - ମକା (Maize): ₹୨,୦୫୦ - ₹୨,୨୦୦ / କ୍ୱିଣ୍ଟାଲ\n  - ଆଳୁ (Potato): ₹୧,୪୦୦ - ₹୧,୭୫୦ / କ୍ୱିଣ୍ଟାଲ\n  - ପିଆଜ (Onion): ₹୨,୨୦୦ - ₹୨,୮୦୦ / କ୍ୱିଣ୍ଟାଲ\n\n💡 *ସୂଚନା:* ନିଜ ଜିଲ୍ଲାର ସଠିକ୍ ଦର ଦେଖିବା ପାଇଁ ସାଇଡବାର୍ କୁ ବ୍ୟବହାର କରନ୍ତୁ।`;
    }
    if (q.includes("invoice") || q.includes("bill") || q.includes("ବିଲ୍") || q.includes("gst")) {
      return `🧾 **GST ଇନଭଏସ୍ (Invoice) କିପରି ତିଆରି କରିବେ:**\n\n1. ସାଇଡବାର୍ ମେନୁରୁ **"Invoices"** କ୍ଲିକ୍ କରନ୍ତୁ।\n2. **"Create New Invoice"** ବଟନ୍ ଦବାନ୍ତୁ।\n3. ଗ୍ରାହକ ବାଛନ୍ତୁ କିମ୍ବା ନୂଆ ଗ୍ରାହକ ଯୋଡନ୍ତୁ।\n4. ଫସଲ, ପରିମାଣ (କ୍ୱିଣ୍ଟାଲ/କିଲୋ) ଓ ମୂଲ୍ୟ ଲେଖନ୍ତୁ — GST ଓ HSN କୋଡ୍ ଆପେ ଆପେ ଆସିଯିବ।\n5. **Save & Print** ଦବାଇ UPI QR ସହିତ PDF ଡାଉନଲୋଡ୍ କରନ୍ତୁ।`;
    }
    return `ନମସ୍କାର! 🙏 ମୁଁ **KrishiBot** — KrishiConnect ର କୃଷି AI ସହାୟକ।\n\nମୁଁ ଆପଣଙ୍କୁ ନିମ୍ନଲିଖିତ ବିଷୟରେ ସାହାଯ୍ୟ କରିପାରିବି:\n- 🌾 ଲାଇଭ୍ ମଣ୍ଡି ଦର\n- 🧾 GST ବିଲ୍ ଓ ଇନଭଏସ୍\n- 🚜 ଟ୍ରକ୍ ପରିବହନ ବୁକିଂ\n- ❄️ ଶୀତଳ ଭଣ୍ଡାର (Cold Storage)\n- 🌦️ ପାଣିପାଗ ଓ ବର୍ଷା ସୂଚନା\n- 🧪 ମାଟି ପରୀକ୍ଷା ଓ ସାର ସୁପାରିଶ\n\nଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିବି?`;
  }

  // Marathi fallback responses
  if (lang === "mr") {
    if (q.includes("mandi") || q.includes("rate") || q.includes("भाव") || q.includes("बाजारभाव")) {
      return `🌾 **KrishiConnect वरील थेट बाजारभाव (Mandi Rates):**\n\n- महाराष्ट्रातील सर्व प्रमुख APMC बाजार समित्यांचे थेट भाव पाहण्यासाठी **"Crop Rates"** टॅबवर जा.\n- **आजचे सरासरी भाव:**\n  - कांदा (Onion): ₹२,२०० - ₹२,८०० / क्विंटल\n  - सोयाबीन (Soybean): ₹४,४०० - ₹४,७५० / क्विंटल\n  - कापूस (Cotton): ₹७,१०० - ₹७,५०० / क्विंटल\n  - गहू (Wheat): ₹२,४५० - ₹२,६०० / क्विंटल\n\n💡 *टीप:* आपल्या जिल्ह्यानुसार अचूक भाव पाहण्यासाठी मेनूमधील Crop Rates वापरा.`;
    }
    return `नमस्कार! 🙏 मी **KrishiBot** — KrishiConnect चा कृषी AI सहाय्यक.\n\nमी तुम्हाला बाजारभाव, GST बिलिंग, वाहतूक बुकिंग, हवामान व खतांच्या सल्ल्याबद्दल मदत करू शकतो. सांगा, मी आपली काय मदत करू?`;
  }

  // Default: Hindi / Hinglish responses
  if (q.includes("mandi") || q.includes("rate") || q.includes("bhaav") || q.includes("bhav") || q.includes("kimat") || q.includes("price")) {
    return `🌾 **Mandi Rates (मंडी भाव) KrishiConnect पर:**\n\n- आप Dashboard के **"Crop Rates"** टैब पर जाकर पूरे भारत और ओडिशा की लाइव APMC मंडियों के भाव देख सकते हैं।\n- **ताज़ा भाव का उदाहरण (औसत):**\n  - धान (Paddy): ₹2,183 - ₹2,320 / क्विंटल\n  - गेहूँ (Wheat): ₹2,450 - ₹2,600 / क्विंटल\n  - मक्का (Maize): ₹2,050 - ₹2,200 / क्विंटल\n  - आलू (Potato): ₹1,400 - ₹1,750 / क्विंटल\n  - प्याज (Onion): ₹2,200 - ₹2,800 / क्विंटल\n\n📌 *सुझाव:* अपने ज़िले और फसल के अनुसार सटीक भाव देखने के लिए साइडबार में **Crop Rates** पर क्लिक करें।`;
  }

  if (q.includes("invoice") || q.includes("bill") || q.includes("gst") || q.includes("challan") || q.includes("rasid")) {
    return `🧾 **GST Invoice कैसे बनाएं:**\n\n1. साइडबार मेन्यू में **"Invoices"** पर क्लिक करें।\n2. **"Create New Invoice"** बटन दबाएं।\n3. ग्राहक (Customer) चुनें या नया जोड़ें।\n4. अपनी फसल/प्रोडक्ट, वज़न (क्विंटल/किलो) और भाव डालें (GST व HSN कोड अपने आप लग जाएगा)।\n5. **Save & Print** पर क्लिक करके PDF डाउनलोड करें या ग्राहक को UPI QR कोड के साथ भेजें।`;
  }

  if (q.includes("truck") || q.includes("transport") || q.includes("gadi") || q.includes("logistics") || q.includes("kiraya")) {
    return `🚜 **Transport & Logistics बुकिंग:**\n\n- KrishiConnect पर आप खेत से मंडी या वेयरहाउस तक ट्रक और पिकअप बुक कर सकते हैं।\n- **सुविधाएं:**\n  - लोड और दूरी (KM) के हिसाब से तुरंत किराया कैलकुलेशन।\n  - वेरीफाइड ड्राइवर और लाइव रूट ट्रैकिंग।\n  - बुकिंग के लिए मेन्यू में **"Transportation"** सेक्शन पर जाएं।`;
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

  return `नमस्ते! 🙏 मैं KrishiConnect का कृषि सहायक (KrishiBot) हूँ।\n\nमैं आपकी इन चीज़ों में मदद कर सकता हूँ:\n- 🌾 **मंडी भाव (Mandi Rates)** चेक करना\n- 🧾 **GST Invoice & Bill** तैयार करना\n- 🚜 **ट्रक / ट्रांसपोर्ट** का किराया और बुकिंग\n- ❄️ **कोल्ड स्टोरेज** स्लॉट बुक करना\n- 🌦️ **मौसम और वर्षा** की सटीक जानकारी\n- 🧪 **मिट्टी की जांच और खाद** का सही संतुलन\n\nबताइए आज आपकी क्या सहायता करूँ?`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];
    const language: string = body.language || "hi";
    const languageName = LANGUAGE_NAMES[language] || "Hindi";

    if (!messages.length) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const latestUserMessage = messages[messages.length - 1]?.content || "";
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();

    const dynamicSystemInstruction = `You are "KrishiBot" (कृषि मित्र), the intelligent AI agricultural assistant for the KrishiConnect platform.

CRITICAL LANGUAGE REQUIREMENT:
The user has actively selected the interface language: "${languageName}" (code: "${language}").
You MUST respond strictly and entirely in ${languageName}.
- If language is Hindi ("hi"): Speak in authentic Hindi (Devanagari script) or natural Hinglish if user speaks Hinglish.
- If language is Odia ("or"): Speak in authentic Odia (ଓଡ଼ିଆ script).
- If language is Marathi ("mr"): Speak in authentic Marathi (मराठी script).
- If language is Punjabi ("pa"): Speak in authentic Punjabi (ਪੰਜਾਬੀ Gurmukhi script).
- If language is Gujarati ("gu"): Speak in authentic Gujarati (ગુજરાતી script).
- If language is Bengali ("bn"): Speak in authentic Bengali (বাংলা script).
- If language is Tamil ("ta"): Speak in authentic Tamil (தமிழ் script).
- If language is Telugu ("te"): Speak in authentic Telugu (తెలుగు script).
- If language is Kannada ("kn"): Speak in authentic Kannada (ಕನ್ನಡ script).
- If language is Malayalam ("ml"): Speak in authentic Malayalam (മലയാളം script).
- If language is English ("en"): Speak in fluent English.

Platform Capabilities to recommend:
1. Mandi Rates: Live APMC commodity prices across India and Odisha.
2. GST Invoicing: Generating GST bills with automatic tax calculation and UPI QR.
3. Logistics & Transport: Booking trucks and calculating freight cost per km.
4. Cold Storage: Booking storage slots for potato, onion, and perishable items.
5. Soil Health: Analyzing soil card parameters (pH, NPK) and fertilizer recommendations.
6. Weather: Rain radar, satellite clouds, and farm advisories.

Keep responses concise, warm, helpful, and formatted with bullet points and emojis.`;

    if (apiKey && apiKey !== "your_gemini_api_key") {
      try {
        const modelNames = [
          "gemini-flash-lite-latest",
          "gemini-flash-latest",
          "gemini-2.5-flash-lite",
          "gemini-2.0-flash",
          "gemini-1.5-flash",
        ];

        for (const model of modelNames) {
          try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            const contents = [
              {
                role: "user",
                parts: [{ text: `[System Instruction: ${dynamicSystemInstruction}]` }],
              },
              {
                role: "model",
                parts: [
                  {
                    text: `Understood. I am KrishiBot. I will strictly converse in ${languageName} to help the farmer/merchant with KrishiConnect and agricultural queries.`,
                  },
                ],
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
                  language,
                });
              }
            }
          } catch (e) {
            // continue to next model
          }
        }
      } catch (err) {
        console.warn("External AI call error, falling back:", err);
      }
    }

    // Smart localized fallback
    const fallbackReply = getSmartFallbackResponse(latestUserMessage, language);
    return NextResponse.json({
      reply: fallbackReply,
      source: "local-assistant",
      model: "krishiconnect-localized-rules",
      language,
    });
  } catch (err: any) {
    console.error("Chat API route error:", err);
    return NextResponse.json(
      { error: "Failed to generate reply", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}
