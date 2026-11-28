"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-context";
import {
  MandiLocation,
  REGIONAL_MANDIS,
  stateToRegionId,
  regionIdToState,
  detectRegionFromAddress,
  findNearestMandi,
  normalizeIndianState,
  getMandisForState,
} from "./mandi-regions";

export type RegionId =
  | "all_india"
  | "maharashtra"
  | "punjab"
  | "haryana"
  | "gujarat"
  | "uttar_pradesh"
  | "madhya_pradesh"
  | "karnataka"
  | "andhra_pradesh"
  | "telangana"
  | "west_bengal"
  | "rajasthan"
  | "bihar"
  | "odisha"
  | "himachal_pradesh"
  | "tamil_nadu"
  | "kerala";

export type LanguageCode =
  | "en"
  | "hi"
  | "or"
  | "mr"
  | "pa"
  | "gu"
  | "kn"
  | "ta"
  | "te"
  | "bn"
  | "ml";

export interface RegionDefinition {
  id: RegionId;
  name: string;
  nativeName: string;
  flag: string;
  defaultLang: LanguageCode;
  supportedLangs: LanguageCode[];
  primaryHubs: string[];
}

export const REGIONS: Record<RegionId, RegionDefinition> = {
  all_india: {
    id: "all_india",
    name: "All India",
    nativeName: "All India",
    flag: "IN",
    defaultLang: "en",
    supportedLangs: ["en", "hi"],
    primaryHubs: ["National APMC"],
  },
  odisha: {
    id: "odisha",
    name: "Odisha",
    nativeName: "Odisha",
    flag: "OD",
    defaultLang: "or",
    supportedLangs: ["or", "hi", "en"],
    primaryHubs: ["Bhubaneswar", "Cuttack", "Sambalpur", "Berhampur"],
  },
  maharashtra: {
    id: "maharashtra",
    name: "Maharashtra",
    nativeName: "Maharashtra",
    flag: "MH",
    defaultLang: "mr",
    supportedLangs: ["mr", "hi", "en"],
    primaryHubs: ["Nashik", "Pune", "Lasalgaon", "Nagpur"],
  },
  punjab: {
    id: "punjab",
    name: "Punjab",
    nativeName: "Punjab",
    flag: "PB",
    defaultLang: "pa",
    supportedLangs: ["pa", "hi", "en"],
    primaryHubs: ["Khanna", "Ludhiana", "Amritsar", "Bathinda"],
  },
  haryana: {
    id: "haryana",
    name: "Haryana",
    nativeName: "Haryana",
    flag: "HR",
    defaultLang: "hi",
    supportedLangs: ["hi", "en", "pa"],
    primaryHubs: ["Karnal", "Sonipat", "Sirsa", "Hisar"],
  },
  gujarat: {
    id: "gujarat",
    name: "Gujarat",
    nativeName: "Gujarat",
    flag: "GJ",
    defaultLang: "gu",
    supportedLangs: ["gu", "hi", "en"],
    primaryHubs: ["Unjha", "Deesa", "Rajkot", "Surat"],
  },
  uttar_pradesh: {
    id: "uttar_pradesh",
    name: "Uttar Pradesh",
    nativeName: "Uttar Pradesh",
    flag: "UP",
    defaultLang: "hi",
    supportedLangs: ["hi", "en"],
    primaryHubs: ["Agra", "Kanpur", "Varanasi", "Lucknow"],
  },
  madhya_pradesh: {
    id: "madhya_pradesh",
    name: "Madhya Pradesh",
    nativeName: "Madhya Pradesh",
    flag: "MP",
    defaultLang: "hi",
    supportedLangs: ["hi", "en"],
    primaryHubs: ["Indore", "Ujjain", "Bhopal", "Neemuch"],
  },
  karnataka: {
    id: "karnataka",
    name: "Karnataka",
    nativeName: "Karnataka",
    flag: "KA",
    defaultLang: "kn",
    supportedLangs: ["kn", "en", "hi"],
    primaryHubs: ["Bengaluru", "Kolar", "Hubballi", "Mysuru"],
  },
  andhra_pradesh: {
    id: "andhra_pradesh",
    name: "Andhra Pradesh",
    nativeName: "Andhra Pradesh",
    flag: "AP",
    defaultLang: "te",
    supportedLangs: ["te", "hi", "en"],
    primaryHubs: ["Guntur", "Vijayawada", "Kurnool", "Tirupati"],
  },
  telangana: {
    id: "telangana",
    name: "Telangana",
    nativeName: "Telangana",
    flag: "TG",
    defaultLang: "te",
    supportedLangs: ["te", "hi", "en"],
    primaryHubs: ["Hyderabad", "Warangal", "Nizamabad", "Khammam"],
  },
  west_bengal: {
    id: "west_bengal",
    name: "West Bengal",
    nativeName: "West Bengal",
    flag: "WB",
    defaultLang: "bn",
    supportedLangs: ["bn", "hi", "en"],
    primaryHubs: ["Kolkata", "Hooghly", "Burdwan", "Siliguri"],
  },
  rajasthan: {
    id: "rajasthan",
    name: "Rajasthan",
    nativeName: "Rajasthan",
    flag: "RJ",
    defaultLang: "hi",
    supportedLangs: ["hi", "en"],
    primaryHubs: ["Jaipur", "Jodhpur", "Kota", "Alwar"],
  },
  bihar: {
    id: "bihar",
    name: "Bihar",
    nativeName: "Bihar",
    flag: "BR",
    defaultLang: "hi",
    supportedLangs: ["hi", "en"],
    primaryHubs: ["Patna", "Purnia", "Muzaffarpur", "Darbhanga"],
  },
  himachal_pradesh: {
    id: "himachal_pradesh",
    name: "Himachal Pradesh",
    nativeName: "Himachal Pradesh",
    flag: "HP",
    defaultLang: "hi",
    supportedLangs: ["hi", "en"],
    primaryHubs: ["Shimla", "Solan", "Kullu", "Mandi"],
  },
  tamil_nadu: {
    id: "tamil_nadu",
    name: "Tamil Nadu",
    nativeName: "Tamil Nadu",
    flag: "TN",
    defaultLang: "ta",
    supportedLangs: ["ta", "en"],
    primaryHubs: ["Chennai", "Coimbatore", "Dindigul", "Madurai"],
  },
  kerala: {
    id: "kerala",
    name: "Kerala",
    nativeName: "Kerala",
    flag: "KL",
    defaultLang: "ml",
    supportedLangs: ["ml", "en"],
    primaryHubs: ["Kochi", "Kozhikode", "Wayanad", "Thrissur"],
  },
};

export const LANGUAGE_METADATA: Record<LanguageCode, { label: string; nativeName: string }> = {
  en: { label: "English", nativeName: "English" },
  hi: { label: "Hindi", nativeName: "हिन्दी" },
  or: { label: "Odia", nativeName: "ଓଡ଼ିଆ" },
  mr: { label: "Marathi", nativeName: "मराठी" },
  pa: { label: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  gu: { label: "Gujarati", nativeName: "ગુજરાતી" },
  kn: { label: "Kannada", nativeName: "ಕನ್ನಡ" },
  ta: { label: "Tamil", nativeName: "தமிழ்" },
  te: { label: "Telugu", nativeName: "తెలుగు" },
  bn: { label: "Bengali", nativeName: "বাংলা" },
  ml: { label: "Malayalam", nativeName: "മലയാളം" },
};

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Auth & Login
    "login.title": "Sign in to KrishiConnect",
    "login.subtitle": "Select your farming region and login with mobile OTP or email.",
    "login.secureBadge": "Secure Mandi Sign In",
    "login.regionPrompt": "Farming Region / State",
    "login.changeRegion": "Change Region",
    "login.languagePrompt": "Preferred Language",
    "login.mobileTab": "Mobile & OTP",
    "login.emailTab": "Email & Password",
    "login.phoneLabel": "Mobile Number",
    "login.phonePlaceholder": "10-digit mobile number",
    "login.sendOtp": "Send SMS OTP",
    "login.sendingOtp": "Sending SMS OTP...",
    "login.enterOtp": "Enter 6-Digit OTP",
    "login.verifyOtp": "Verify & Enter Platform",
    "login.verifyingOtp": "Verifying Code...",
    "login.nameOptional": "Your Name / Business Name (Optional)",
    "login.namePlaceholder": "e.g., Ramesh Kumar / Jai Kisan Agro",
    "login.resendOtp": "Resend Code",
    "login.resendIn": "Resend in {s}s",
    "login.emailLabel": "Email Address",
    "login.passwordLabel": "Password",
    "login.signInBtn": "Sign In to Dashboard",
    "login.signingIn": "Signing In...",
    "login.demoFarmer": "1-Click Farmer Demo",
    "login.demoTrader": "1-Click Trader Demo",
    "login.quickAccess": "OR INSTANT 1-CLICK DEMO ACCESS",
    "login.needAccount": "Don't have an account?",
    "login.registerNow": "Register your farm business",
    "login.regionNotice": "Mandi rates, soil metrics, and APMC clusters will be tailored for {region}.",

    // Navigation & Sidebar
    "nav.mandiIntelligence": "Mandi Intelligence",
    "nav.farmOperations": "Farm Operations",
    "nav.supportLegal": "Support & Legal",
    "nav.dailyCropRates": "Daily Crop Rates",
    "nav.notifications": "Agri Alerts & Notifications",
    "nav.rateTrends": "7-Day Rate Trends",
    "nav.transportation": "Transportation & Freight",
    "nav.buyers": "Crop Buyers Directory",
    "nav.dashboard": "Farmer Dashboard",
    "nav.soilHealth": "Soil Health Check",
    "nav.fertilizer": "Fertilizer & Subsidies",
    "nav.coldStorage": "Cold Storage Near You",
    "nav.equipment": "Farm Equipment & Machinery",
    "nav.cropPlanner": "Season Crop Planner",
    "nav.weather": "Farm Weather & Rain",
    "nav.products": "Crops & Produce Inventory",
    "nav.invoices": "Invoices & GST Billing",
    "nav.settings": "Settings",
    "nav.contact": "Contact & WhatsApp",
    "nav.copyright": "Copyright Policy",
    "nav.logout": "Log Out",
    "nav.openPlatform": "Open Platform",

    // Common
    "common.live": "Live",
    "common.new": "New",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.region": "Region",
    "common.language": "Language",
    "common.activeRegion": "Active State",
  },

  or: {
    // Odia
    "login.title": "କୃଷିକନେକ୍ଟରେ ସାଇନ୍ ଇନ୍ କରନ୍ତୁ",
    "login.subtitle": "ଆପଣଙ୍କର ଚାଷ ଅଞ୍ଚଳ ବାଛନ୍ତୁ ଏବଂ ମୋବାଇଲ୍ OTP କିମ୍ବା ଇମେଲ୍ ମାଧ୍ୟମରେ ଲଗଇନ୍ କରନ୍ତୁ।",
    "login.secureBadge": "ସୁରକ୍ଷିତ ମଣ୍ଡି ଲଗଇନ୍",
    "login.regionPrompt": "ଚାଷ ଅଞ୍ଚଳ / ରାଜ୍ୟ",
    "login.changeRegion": "ଅଞ୍ଚଳ ବଦଳାନ୍ତୁ",
    "login.languagePrompt": "ପସନ୍ଦିତ ଭାଷା",
    "login.mobileTab": "ମୋବାଇଲ୍ ଓ OTP",
    "login.emailTab": "ଇମେଲ୍ ଓ ପାସୱାର୍ଡ",
    "login.phoneLabel": "ମୋବାଇଲ୍ ନମ୍ବର",
    "login.phonePlaceholder": "୧୦ ଅଙ୍କର ମୋବାଇଲ୍ ନମ୍ବର",
    "login.sendOtp": "SMS OTP ପଠାନ୍ତୁ",
    "login.sendingOtp": "SMS OTP ପଠାଯାଉଛି...",
    "login.enterOtp": "୬ ଅଙ୍କ ବିଶିଷ୍ଟ OTP ଦିଅନ୍ତୁ",
    "login.verifyOtp": "ଯାଞ୍ଚ କରି ପ୍ରବେଶ କରନ୍ତୁ",
    "login.verifyingOtp": "OTP ଯାଞ୍ଚ ହେଉଛି...",
    "login.nameOptional": "ଆପଣଙ୍କ ନାମ / ଚାଷ କେନ୍ଦ୍ର ନାମ (ଇଚ୍ଛାଧୀନ)",
    "login.namePlaceholder": "ଯଥା: ରମେଶ ପ୍ରଧାନ / ଜୟ କିଷାନ",
    "login.resendOtp": "ପୁଣି କୋଡ୍ ପଠାନ୍ତୁ",
    "login.resendIn": "{s} ସେକେଣ୍ଡ ପରେ ପୁନଃ ପଠାନ୍ତୁ",
    "login.emailLabel": "ଇମେଲ୍ ଠିକଣା",
    "login.passwordLabel": "ପାସୱାର୍ଡ",
    "login.signInBtn": "ଡ୍ୟାସବୋର୍ଡରେ ପ୍ରବେଶ କରନ୍ତୁ",
    "login.signingIn": "ଲଗଇନ୍ ହେଉଛି...",
    "login.demoFarmer": "୧-କ୍ଲିକ୍ ଚାଷୀ ଡେମୋ",
    "login.demoTrader": "୧-କ୍ଲିକ୍ ବ୍ୟବସାୟୀ ଡେମୋ",
    "login.quickAccess": "କିମ୍ବା ତତକ୍ଷଣାତ୍ ୧-କ୍ଲିକ୍ ଡେମୋ ବ୍ୟବହାର କରନ୍ତୁ",
    "login.needAccount": "ଖାତା ନାହିଁ କି?",
    "login.registerNow": "ନୂତନ ପଞ୍ଜୀକରଣ କରନ୍ତୁ",
    "login.regionNotice": "ମଣ୍ଡି ଦର, ମୃତ୍ତିକା ବିବରଣୀ ଏବଂ APMC ତଥ୍ୟ {region} ପାଇଁ ପ୍ରଦର୍ଶିତ ହେବ।",

    // Navigation
    "nav.mandiIntelligence": "ମଣ୍ଡି ସୂଚନା",
    "nav.farmOperations": "ଚାଷ କାର୍ଯ୍ୟ",
    "nav.supportLegal": "ସହାୟତା ଓ ଆଇନ",
    "nav.dailyCropRates": "ଦୈନିକ ମଣ୍ଡି ଫସଲ ଦର",
    "nav.notifications": "କୃଷି ଆଲର୍ଟ ଓ ସୂଚନା",
    "nav.rateTrends": "୭ ଦିନର ଦର ଟ୍ରେଣ୍ଡ୍",
    "nav.transportation": "ପରିବହନ ଓ ମାଲବାହୀ",
    "nav.buyers": "ଫସଲ କ୍ରେତା ତାଲିକା",
    "nav.dashboard": "କୃଷକ ଡ୍ୟାସବୋର୍ଡ",
    "nav.soilHealth": "ମୃତ୍ତିକା ସ୍ୱାସ୍ଥ୍ୟ ପରୀକ୍ଷା",
    "nav.fertilizer": "ସାର ଓ ସବସିଡି",
    "nav.coldStorage": "ନିକଟସ୍ଥ କୋଲ୍ଡ ଷ୍ଟୋରେଜ୍",
    "nav.equipment": "କୃଷି ଯନ୍ତ୍ରପାତି ଓ ଭଡ଼ା",
    "nav.cropPlanner": "ଆଗାମୀ ଋତୁ ଯୋଜନା",
    "nav.weather": "ପାଣିପାଗ ଓ ବର୍ଷା ସୂଚନା",
    "nav.products": "ଫସଲ ଗଚ୍ଛିତ ତାଲିକା",
    "nav.invoices": "ବିଲ୍ ଓ GST ଇନଭଏସ୍",
    "nav.settings": "ସେଟିଂସ୍",
    "nav.contact": "ଯୋଗାଯୋଗ ଓ ହ୍ୱାଟ୍ସଆପ୍",
    "nav.copyright": "କପିରାଇଟ୍ ନୀତି",
    "nav.logout": "ଲଗ୍ ଆଉଟ୍",
    "nav.openPlatform": "ପ୍ଲାଟଫର୍ମ ଖୋଲନ୍ତୁ",

    "common.live": "ଲାଇଭ୍",
    "common.new": "ନୂଆ",
    "common.save": "ସଂରକ୍ଷଣ",
    "common.cancel": "ବାତିଲ",
    "common.region": "ଅଞ୍ଚଳ",
    "common.language": "ଭାଷା",
    "common.activeRegion": "ସକ୍ରିୟ ରାଜ୍ୟ",
  },

  hi: {
    // Hindi
    "login.title": "कृषिकनेक्ट में साइन इन करें",
    "login.subtitle": "अपना कृषि क्षेत्र चुनें और मोबाइल OTP या ईमेल से लॉगिन करें।",
    "login.secureBadge": "सुरक्षित मंडी लॉगिन",
    "login.regionPrompt": "कृषि क्षेत्र / राज्य",
    "login.changeRegion": "राज्य बदलें",
    "login.languagePrompt": "पसंदीदा भाषा",
    "login.mobileTab": "मोबाइल और OTP",
    "login.emailTab": "ईमेल और पासवर्ड",
    "login.phoneLabel": "मोबाइल नंबर",
    "login.phonePlaceholder": "10 अंकों का मोबाइल नंबर",
    "login.sendOtp": "SMS OTP भेजें",
    "login.sendingOtp": "SMS भेजा जा रहा है...",
    "login.enterOtp": "6 अंकों का OTP दर्ज करें",
    "login.verifyOtp": "सत्यापित करें और प्रवेश करें",
    "login.verifyingOtp": "सत्यापन जारी है...",
    "login.nameOptional": "आपका नाम / फार्म का नाम (वैकल्पिक)",
    "login.namePlaceholder": "उदा: रमेश कुमार / जय किसान फार्म",
    "login.resendOtp": "पुनः कोड भेजें",
    "login.resendIn": "{s} सेकंड बाद पुनः भेजें",
    "login.emailLabel": "ईमेल पता",
    "login.passwordLabel": "पासवर्ड",
    "login.signInBtn": "डैशबोर्ड में प्रवेश करें",
    "login.signingIn": "लॉगिन हो रहा है...",
    "login.demoFarmer": "1-क्लिक किसान डेमो",
    "login.demoTrader": "1-क्लिक व्यापारी डेमो",
    "login.quickAccess": "या तुरंत 1-क्लिक डेमो द्वारा प्रवेश करें",
    "login.needAccount": "खाता नहीं है?",
    "login.registerNow": "नया व्यापार पंजीकृत करें",
    "login.regionNotice": "मंडी भाव, मिट्टी की स्थिति और APMC डेटा {region} के अनुसार अनुकूलित होंगे।",

    // Navigation
    "nav.mandiIntelligence": "मंडी इंटेलिजेंस",
    "nav.farmOperations": "फार्म संचालन",
    "nav.supportLegal": "सहायता और नियम",
    "nav.dailyCropRates": "दैनिक फसल मंडी भाव",
    "nav.notifications": "कृषि अलर्ट और सूचनाएं",
    "nav.rateTrends": "7 दिवसीय भाव रुझान",
    "nav.transportation": "परिवहन और लॉजिस्टिक्स",
    "nav.buyers": "फसल खरीदार सूची",
    "nav.dashboard": "किसान डैशबोर्ड",
    "nav.soilHealth": "मिट्टी स्वास्थ्य जांच",
    "nav.fertilizer": "उर्वरक एवं सब्सिडी",
    "nav.coldStorage": "नजदीकी कोल्ड स्टोरेज",
    "nav.equipment": "कृषि उपकरण व मशीनरी",
    "nav.cropPlanner": "अगले मौसम की फसल योजना",
    "nav.weather": "मौसम और वर्षा पूर्वानुमान",
    "nav.products": "फसल और उपज स्टॉक",
    "nav.invoices": "बिल और GST चालान",
    "nav.settings": "सेटिंग्स",
    "nav.contact": "संपर्क करें व WhatsApp",
    "nav.copyright": "कॉपीराइट नीति",
    "nav.logout": "लॉग आउट",
    "nav.openPlatform": "प्लेटफॉर्म खोलें",

    "common.live": "लाइव",
    "common.new": "नया",
    "common.save": "सहेजें",
    "common.cancel": "रद्द करें",
    "common.region": "क्षेत्र",
    "common.language": "भाषा",
    "common.activeRegion": "सक्रिय राज्य",
  },

  mr: {
    // Marathi (Maharashtra)
    "login.title": "कृषीकनेक्ट मध्ये साइन इन करा",
    "login.subtitle": "आपला कृषी विभाग निवडा आणि मोबाईल OTP किंवा ईमेलने लॉगिन करा.",
    "login.secureBadge": "सुरक्षित कृषी बाजार लॉगिन",
    "login.regionPrompt": "कृषी विभाग / राज्य",
    "login.changeRegion": "विभाग बदला",
    "login.languagePrompt": "पसंतीची भाषा",
    "login.mobileTab": "मोबाईल व OTP",
    "login.emailTab": "ईमेल व पासवर्ड",
    "login.phoneLabel": "मोबाईल नंबर",
    "login.phonePlaceholder": "१० अंकी मोबाईल नंबर",
    "login.sendOtp": "SMS OTP पाठवा",
    "login.sendingOtp": "SMS पाठवत आहे...",
    "login.enterOtp": "६ अंकी OTP टाका",
    "login.verifyOtp": "सत्यापित करा व प्रवेश करा",
    "login.verifyingOtp": "पडताळणी सुरू आहे...",
    "login.nameOptional": "आपले नाव / शेतीचे नाव (पर्यायी)",
    "login.namePlaceholder": "उदा: रमेश पाटील / जय किसान ॲग्रो",
    "login.resendOtp": "पुन्हा कोड पाठवा",
    "login.resendIn": "{s} सेकंदात पुन्हा पाठवा",
    "login.emailLabel": "ईमेल पत्ता",
    "login.passwordLabel": "पासवर्ड",
    "login.signInBtn": "डॅशबोर्डवर जा",
    "login.signingIn": "लॉगिन होत आहे...",
    "login.demoFarmer": "१-क्लिक शेतकरी डेमो",
    "login.demoTrader": "१-क्लिक व्यापारी डेमो",
    "login.quickAccess": "किंवा त्वरित १-क्लिक डेमो वापरा",
    "login.needAccount": "खाते नाही का?",
    "login.registerNow": "नवीन नोंदणी करा",
    "login.regionNotice": "बाजारभाव, माती परीक्षण आणि APMC डेटा {region} प्रमाणे दिसेल.",

    "nav.mandiIntelligence": "बाजार माहिती",
    "nav.farmOperations": "शेती कामकाज",
    "nav.supportLegal": "मदत व नियम",
    "nav.dailyCropRates": "दैनिक बाजार भाव",
    "nav.notifications": "शेती अलर्ट आणि सूचना",
    "nav.rateTrends": "७ दिवसांचे दर ट्रेंड",
    "nav.transportation": "वाहतूक व वाहतूक व्यवस्था",
    "nav.buyers": "शेतमाल खरेदीदार",
    "nav.dashboard": "शेतकरी डॅशबोर्ड",
    "nav.soilHealth": "मृदा आरोग्य तपासणी",
    "nav.fertilizer": "खते आणि अनुदान",
    "nav.coldStorage": "जवळचे शीतगृह (कोल्ड स्टोरेज)",
    "nav.equipment": "शेती अवजारे व यंत्रे",
    "nav.cropPlanner": "पुढील हंगामाचे नियोजन",
    "nav.weather": "हवामान व पाऊस अंदाज",
    "nav.products": "शेतमाल साठा",
    "nav.invoices": "बिले व GST पावती",
    "nav.settings": "सेटिंग्ज",
    "nav.contact": "संपर्क व WhatsApp",
    "nav.copyright": "कॉपीराइट धोरण",
    "nav.logout": "लॉग आउट",
    "nav.openPlatform": "प्लॅटफॉर्म उघडा",

    "common.live": "थेट",
    "common.new": "नवीन",
    "common.save": "जतन करा",
    "common.cancel": "रद्द करा",
    "common.region": "विभाग",
    "common.language": "भाषा",
    "common.activeRegion": "सक्रिय राज्य",
  },

  pa: {
    // Punjabi (Punjab)
    "login.title": "ਕ੍ਰਿਸ਼ੀਕਨੈਕਟ ਵਿੱਚ ਸਾਈਨ ਇਨ ਕਰੋ",
    "login.subtitle": "ਆਪਣਾ ਖੇਤੀ ਖੇਤਰ ਚੁਣੋ ਅਤੇ ਮੋਬਾਈਲ OTP ਜਾਂ ਈਮੇਲ ਨਾਲ ਲੌਗਇਨ ਕਰੋ।",
    "login.secureBadge": "ਸੁਰੱਖਿਅਤ ਮੰਡੀ ਲੌਗਇਨ",
    "login.regionPrompt": "ਖੇਤੀ ਖੇਤਰ / ਸੂਬਾ",
    "login.changeRegion": "ਸੂਬਾ ਬਦਲੋ",
    "login.languagePrompt": "ਮਨਪਸੰਦ ਭਾਸ਼ਾ",
    "login.mobileTab": "ਮੋਬਾਈਲ ਅਤੇ OTP",
    "login.emailTab": "ਈਮੇਲ ਅਤੇ ਪਾਸਵਰਡ",
    "login.phoneLabel": "ਮੋਬਾਈਲ ਨੰਬਰ",
    "login.phonePlaceholder": "10 ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ",
    "login.sendOtp": "SMS OTP ਭੇਜੋ",
    "login.sendingOtp": "SMS ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ...",
    "login.enterOtp": "6 ਅੰਕਾਂ ਦਾ OTP ਦਰਜ ਕਰੋ",
    "login.verifyOtp": "ਪੁਸ਼ਟੀ ਕਰੋ ਅਤੇ ਦਾਖਲ ਹੋਵੋ",
    "login.verifyingOtp": "ਪੁਸ਼ਟੀ ਹੋ ਰਹੀ ਹੈ...",
    "login.nameOptional": "ਤੁਹਾਡਾ ਨਾਮ / ਫਾਰਮ ਦਾ ਨਾਮ (ਵਿਕਲਪਿਕ)",
    "login.namePlaceholder": "ਜਿਵੇਂ: ਗੁਰਪ੍ਰੀਤ ਸਿੰਘ / ਜੈ ਕਿਸਾਨ ਫਾਰਮ",
    "login.resendOtp": "ਦੁਬਾਰਾ ਕੋਡ ਭੇਜੋ",
    "login.resendIn": "{s} ਸਕਿੰਟ ਬਾਅਦ ਭੇਜੋ",
    "login.emailLabel": "ਈਮੇਲ ਪਤਾ",
    "login.passwordLabel": "ਪਾਸਵਰਡ",
    "login.signInBtn": "ਡੈਸ਼ਬੋਰਡ ਵਿੱਚ ਦਾਖਲ ਹੋਵੋ",
    "login.signingIn": "ਲੌਗਇਨ ਹੋ ਰਿਹਾ ਹੈ...",
    "login.demoFarmer": "1-ਕਲਿੱਕ ਕਿਸਾਨ ਡੈਮੋ",
    "login.demoTrader": "1-ਕਲਿੱਕ ਵਪਾਰੀ ਡੈਮੋ",
    "login.quickAccess": "ਜਾਂ ਤੁਰੰਤ 1-ਕਲਿੱਕ ਡੈਮੋ ਨਾਲ ਦਾਖਲ ਹੋਵੋ",
    "login.needAccount": "ਖਾਤਾ ਨਹੀਂ ਹੈ?",
    "login.registerNow": "ਨਵਾਂ ਕਾਰੋਬਾਰ ਦਰਜ ਕਰੋ",
    "login.regionNotice": "ਮੰਡੀ ਰੇਟ, ਮਿੱਟੀ ਪਰਖ ਅਤੇ APMC ਡੇਟਾ {region} ਅਨੁਸਾਰ ਦਿਖਾਇਆ ਜਾਵੇਗਾ।",

    "nav.mandiIntelligence": "ਮੰਡੀ ਜਾਣਕਾਰੀ",
    "nav.farmOperations": "ਖੇਤੀ ਕੰਮਕਾਜ",
    "nav.supportLegal": "ਮਦਦ ਅਤੇ ਨਿਯਮ",
    "nav.dailyCropRates": "ਰੋਜ਼ਾਨਾ ਮੰਡੀ ਭਾਅ",
    "nav.notifications": "ਖੇਤੀ ਅਲਰਟ ਅਤੇ ਸੂਚਨਾਵਾਂ",
    "nav.rateTrends": "7 ਦਿਨਾਂ ਦੇ ਭਾਅ ਰੁਝਾਨ",
    "nav.transportation": "ਟਰਾਂਸਪੋਰਟ ਅਤੇ ਢੋਆ-ਢੁਆਈ",
    "nav.buyers": "ਫਸਲ ਖਰੀਦਦਾਰ ਸੂਚੀ",
    "nav.dashboard": "ਕਿਸਾਨ ਡੈਸ਼ਬੋਰਡ",
    "nav.soilHealth": "ਮਿੱਟੀ ਦੀ ਪਰਖ",
    "nav.fertilizer": "ਖਾਦਾਂ ਅਤੇ ਸਬਸਿਡੀ",
    "nav.coldStorage": "ਨੇੜਲਾ ਕੋਲਡ ਸਟੋਰੇਜ",
    "nav.equipment": "ਖੇਤੀਬਾੜੀ ਸੰਦ ਤੇ ਮਸ਼ੀਨਰੀ",
    "nav.cropPlanner": "ਅਗਲੇ ਸੀਜ਼ਨ ਦੀ ਯੋਜਨਾ",
    "nav.weather": "ਮੌਸਮ ਅਤੇ ਮੀਂਹ ਜਾਣਕਾਰੀ",
    "nav.products": "ਫਸਲ ਸਟਾਕ",
    "nav.invoices": "ਬਿੱਲ ਅਤੇ GST ਚਲਾਨ",
    "nav.settings": "ਸੈਟਿੰਗਾਂ",
    "nav.contact": "ਸੰਪਰਕ ਕਰੋ ਅਤੇ WhatsApp",
    "nav.copyright": "ਕਾਪੀਰਾਈਟ ਨੀਤੀ",
    "nav.logout": "ਲੌਗ ਆਉਟ",
    "nav.openPlatform": "ਪਲੇਟਫਾਰਮ ਖੋਲ੍ਹੋ",

    "common.live": "ਲਾਈਵ",
    "common.new": "ਨਵਾਂ",
    "common.save": "ਸੰਭਾਲੋ",
    "common.cancel": "ਰੱਦ ਕਰੋ",
    "common.region": "ਖੇਤਰ",
    "common.language": "ਭਾਸ਼ਾ",
    "common.activeRegion": "ਸਰਗਰਮ ਸੂਬਾ",
  },

  gu: {
    // Gujarati
    "login.title": "કૃષિકનેક્ટમાં સાઇન ઇન કરો",
    "login.subtitle": "તમારો કૃષિ વિસ્તાર પસંદ કરો અને મોબાઇલ OTP અથવા ઇમેઇલથી લોગિન કરો.",
    "login.secureBadge": "સુરક્ષિત મંડી લૉગિન",
    "login.regionPrompt": "કૃષિ વિસ્તાર / રાજ્ય",
    "login.changeRegion": "રાજ્ય બદલો",
    "login.languagePrompt": "પસંદગીની ભાષા",
    "login.mobileTab": "મોબાઇલ અને OTP",
    "login.emailTab": "ઇમેઇલ અને પાસવર્ડ",
    "login.phoneLabel": "મોબાઇલ નંબર",
    "login.phonePlaceholder": "૧૦ અંકનો મોબાઇલ નંબર",
    "login.sendOtp": "SMS OTP મોકલો",
    "login.sendingOtp": "SMS મોકલાઈ રહ્યો છે...",
    "login.enterOtp": "૬ અંકનો OTP દાખલ કરો",
    "login.verifyOtp": "ચકાસો અને આગળ વધો",
    "login.verifyingOtp": "ચકાસણી ચાલુ છે...",
    "login.nameOptional": "તમારું નામ / ફાર્મનું નામ (વૈકલ્પિક)",
    "login.namePlaceholder": "દા.ત.: રમેશભાઈ પટેલ / જય કિસાન એગ્રો",
    "login.resendOtp": "ફરીથી કોડ મોકલો",
    "login.resendIn": "{s} સેકન્ડમાં ફરીથી મોકલો",
    "login.emailLabel": "ઇમેઇલ સરનામું",
    "login.passwordLabel": "પાસવર્ડ",
    "login.signInBtn": "ડેશબોર્ડ ખોલો",
    "login.signingIn": "લૉગિન થઈ રહ્યું છે...",
    "login.demoFarmer": "૧-ક્લિક ખેડૂત ડેમો",
    "login.demoTrader": "૧-ક્લિક વેપારી ડેમો",
    "login.quickAccess": "અથવા ત્વરિત ૧-ક્લિક ડેમો વડે પ્રવેશ કરો",
    "login.needAccount": "ખાતું નથી?",
    "login.registerNow": "નવી નોંધણી કરો",
    "login.regionNotice": "મંડી ભાવો, જમીન પરીક્ષણ અને APMC ડેટા {region} મુજબ દેખાશે.",

    "nav.mandiIntelligence": "મંડી માહિતી",
    "nav.farmOperations": "ખેતી કામગીરી",
    "nav.supportLegal": "મદદ અને નિયમો",
    "nav.dailyCropRates": "દૈનિક મંડી પાક ભાવ",
    "nav.notifications": "કૃષિ ચેતવણી અને સૂચનાઓ",
    "nav.rateTrends": "૭ દિવસના ભાવ પ્રવાહો",
    "nav.transportation": "પરિવહન અને લોજિસ્ટિક્સ",
    "nav.buyers": "પાક ખરીદદાર યાદી",
    "nav.dashboard": "ખેડૂત ડેશબોર્ડ",
    "nav.soilHealth": "જમીન આરોગ્ય ચકાસણી",
    "nav.fertilizer": "ખાતર અને સબસિડી",
    "nav.coldStorage": "નજીકનું કોલ્ડ સ્ટોરેજ",
    "nav.equipment": "ખેતીના સાધનો અને મશીનરી",
    "nav.cropPlanner": "આગામી સિઝનનું આયોજન",
    "nav.weather": "હવામાન અને વરસાદ",
    "nav.products": "પાક ઉત્પાદન સ્ટોક",
    "nav.invoices": "બિલ અને GST ઇન્વૉઇસ",
    "nav.settings": "સેટિંગ્સ",
    "nav.contact": "સંપર્ક કરો અને WhatsApp",
    "nav.copyright": "કોપીરાઇટ નીતિ",
    "nav.logout": "લૉગ આઉટ",
    "nav.openPlatform": "પ્લેટફોર્મ ખોલો",

    "common.live": "લાઇવ",
    "common.new": "નવું",
    "common.save": "સાચવો",
    "common.cancel": "રદ કરો",
    "common.region": "વિસ્તાર",
    "common.language": "ભાષા",
    "common.activeRegion": "સક્રિય રાજ્ય",
  },

  kn: {
    // Kannada
    "login.title": "ಕೃಷಿಕನೆಕ್ಟ್‌ಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ",
    "login.subtitle": "ನಿಮ್ಮ ಕೃಷಿ ಪ್ರದೇಶವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಮೊಬೈಲ್ OTP ಅಥವಾ ಇಮೇಲ್ ಮೂಲಕ ಲಾಗಿನ್ ಮಾಡಿ.",
    "login.secureBadge": "ಸುರಕ್ಷಿತ ಮಾರುಕಟ್ಟೆ ಲಾಗಿನ್",
    "login.regionPrompt": "ಕೃಷಿ ಪ್ರದೇಶ / ರಾಜ್ಯ",
    "login.changeRegion": "ರಾಜ್ಯ ಬದಲಾಯಿಸಿ",
    "login.languagePrompt": "ಆದ್ಯತೆಯ ಭಾಷೆ",
    "login.mobileTab": "ಮೊಬೈಲ್ ಮತ್ತು OTP",
    "login.emailTab": "ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್ವರ್ಡ್",
    "login.phoneLabel": "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    "login.phonePlaceholder": "೧೦ ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    "login.sendOtp": "SMS OTP ಕಳುಹಿಸಿ",
    "login.sendingOtp": "SMS ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...",
    "login.enterOtp": "೬ ಅಂಕಿಯ OTP ನಮೂದಿಸಿ",
    "login.verifyOtp": "ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಪ್ರವೇಶಿಸಿ",
    "login.verifyingOtp": "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    "login.nameOptional": "ನಿಮ್ಮ ಹೆಸರು / ಫಾರ್ಮ್ ಹೆಸರು (ಐಚ್ಛಿಕ)",
    "login.namePlaceholder": "ಉದಾ: ರಮೇಶ್ ಗೌಡ / ಜೈ ಕಿಸಾನ್",
    "login.resendOtp": "ಮತ್ತೆ ಕೋಡ್ ಕಳುಹಿಸಿ",
    "login.resendIn": "{s} ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಮರುಕಳುಹಿಸಿ",
    "login.emailLabel": "ಇಮೇಲ್ ವಿಳಾಸ",
    "login.passwordLabel": "ಪಾಸ್‌ವರ್ಡ್",
    "login.signInBtn": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ",
    "login.signingIn": "ಲಾಗಿನ್ ಆಗುತ್ತಿದೆ...",
    "login.demoFarmer": "೧-ಕ್ಲಿಕ್ ರೈತ ಡೆಮೊ",
    "login.demoTrader": "೧-ಕ್ಲಿಕ್ ವ್ಯಾಪಾರಿ ಡೆಮೊ",
    "login.quickAccess": "ಅಥವಾ ೧-ಕ್ಲಿಕ್ ಡೆಮೊ ಮೂಲಕ ಲಾಗಿನ್ ಆಗಿ",
    "login.needAccount": "ಖಾತೆ ಇಲ್ಲವೇ?",
    "login.registerNow": "ಹೊಸ ನೋಂದಣಿ ಮಾಡಿ",
    "login.regionNotice": "ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು, ಮಣ್ಣಿನ ಮಾಹಿತಿ ಮತ್ತು APMC ಡೇಟಾ {region} ಪ್ರಕಾರ ಲಭ್ಯವಿರುತ್ತದೆ.",

    "nav.mandiIntelligence": "ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ",
    "nav.farmOperations": "ಕೃಷಿ ಚಟುವಟಿಕೆಗಳು",
    "nav.supportLegal": "ಬೆಂಬಲ ಮತ್ತು ನಿಯಮಗಳು",
    "nav.dailyCropRates": "ದೈನಂದಿನ ಬೆಳೆ ಮಾರುಕಟ್ಟೆ ದರ",
    "nav.notifications": "ಕೃಷಿ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಅಧಿಸೂಚನೆಗಳು",
    "nav.rateTrends": "೭ ದಿನಗಳ ದರ ಪ್ರವೃತ್ತಿಗಳು",
    "nav.transportation": "ಸಾರಿಗೆ ಮತ್ತು ಸರಕು ಸಾಗಣೆ",
    "nav.buyers": "ಬೆಳೆ ಖರೀದಿದಾರರ ಪಟ್ಟಿ",
    "nav.dashboard": "ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "nav.soilHealth": "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ತಪಾಸಣೆ",
    "nav.fertilizer": "ಗೊಬ್ಬರ ಮತ್ತು ಸಬ್ಸಿಡಿ",
    "nav.coldStorage": "ಹತ್ತಿರದ ಶೀತಲ ಸಂಗ್ರಹಾಗಾರ",
    "nav.equipment": "ಕೃಷಿ ಉಪಕರಣಗಳು ಮತ್ತು ಯಂತ್ರೋಪಕರಣ",
    "nav.cropPlanner": "ಮುಂದಿನ ಋತುವಿನ ಯೋಜನೆ",
    "nav.weather": "ಹವಾಮಾನ ಮತ್ತು ಮಳೆ ಮುನ್ಸೂಚನೆ",
    "nav.products": "ಬೆಳೆಗಳ ದಾಸ್ತಾನು",
    "nav.invoices": "ಬಿಲ್ ಮತ್ತು GST ಇನ್ವಾಯ್ಸ್",
    "nav.settings": "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    "nav.contact": "ಸಂಪರ್ಕಿಸಿ ಮತ್ತು WhatsApp",
    "nav.copyright": "ಕೃತಿಸ್ವಾಮ್ಯ ನೀತಿ",
    "nav.logout": "ಲಾಗ್ ಔಟ್",
    "nav.openPlatform": "ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ತೆರೆಯಿರಿ",

    "common.live": "ಲೈವ್",
    "common.new": "ಹೊಸ",
    "common.save": "ಉಳಿಸಿ",
    "common.cancel": "ರದ್ದುಮಾಡಿ",
    "common.region": "ಪ್ರದೇಶ",
    "common.language": "ಭಾಷೆ",
    "common.activeRegion": "ಸಕ್ರಿಯ ರಾಜ್ಯ",
  },

  ta: {
    // Tamil
    "login.title": "கிருஷிகனெக்டில் உள்நுழையவும்",
    "login.subtitle": "உங்கள் விவசாய பகுதியைத் தேர்ந்தெடுத்து மொபைல் OTP அல்லது மின்னஞ்சல் மூலம் உள்நுழையவும்.",
    "login.secureBadge": "பாதுகாப்பான மண்டி உள்நுழைவு",
    "login.regionPrompt": "விவசாய பகுதி / மாநிலம்",
    "login.changeRegion": "மாநிலத்தை மாற்றவும்",
    "login.languagePrompt": "விருப்பமான மொழி",
    "login.mobileTab": "மொபைல் & OTP",
    "login.emailTab": "மின்னஞ்சல் & கடவுச்சொல்",
    "login.phoneLabel": "மொபைல் எண்",
    "login.phonePlaceholder": "10 இலக்க மொபைல் எண்",
    "login.sendOtp": "SMS OTP அனுப்பவும்",
    "login.sendingOtp": "SMS அனுப்பப்படுகிறது...",
    "login.enterOtp": "6 இலக்க OTP ஐ உள்ளிடவும்",
    "login.verifyOtp": "சரிபார்த்து நுழையவும்",
    "login.verifyingOtp": "சரிபார்க்கப்படுகிறது...",
    "login.nameOptional": "உங்கள் பெயர் / பண்ணை பெயர் (விருப்பமானது)",
    "login.namePlaceholder": "எ.கா: ரமேஷ் குமார் / ஜெய் கிசான்",
    "login.resendOtp": "குறியீட்டை மீண்டும் அனுப்பவும்",
    "login.resendIn": "{s} வினாடிகளில் மீண்டும் அனுப்பவும்",
    "login.emailLabel": "மின்னஞ்சல் முகவரி",
    "login.passwordLabel": "கடவுச்சொல்",
    "login.signInBtn": "டாஷ்போர்டிற்குச் செல்லவும்",
    "login.signingIn": "உள்நுழைகிறது...",
    "login.demoFarmer": "1-கிளிக் விவசாயி டெமோ",
    "login.demoTrader": "1-கிளிக் வியாபாரி டெமோ",
    "login.quickAccess": "அல்லது உடனடி 1-கிளிக் டெமோ மூலம் நுழையவும்",
    "login.needAccount": "கணக்கு இல்லையா?",
    "login.registerNow": "புதிய பதிவு செய்யவும்",
    "login.regionNotice": "மண்டி விலைகள் மற்றும் APMC விவரங்கள் {region} சார்ந்து காட்டப்படும்.",

    "nav.mandiIntelligence": "மண்டி நுண்ணறிவு",
    "nav.farmOperations": "பண்ணை செயல்பாடுகள்",
    "nav.supportLegal": "உதவி மற்றும் கொள்கை",
    "nav.dailyCropRates": "தினசரி பயிர் சந்தை விலை",
    "nav.notifications": "விவசாய எச்சரிக்கைகள் மற்றும் அறிவிப்புகள்",
    "nav.rateTrends": "7 நாள் விலை போக்குகள்",
    "nav.transportation": "போக்குவரத்து மற்றும் சரக்கு",
    "nav.buyers": "பயிர் வாங்குவோர் பட்டியல்",
    "nav.dashboard": "விவசாயி டாஷ்போர்டு",
    "nav.soilHealth": "மண் ஆரோக்கிய பரிசோதனை",
    "nav.fertilizer": "உரம் மற்றும் மானியம்",
    "nav.coldStorage": "அருகிலுள்ள குளிர்பதனக் கிடங்கு",
    "nav.equipment": "விவசாயக் கருவிகள் & இயந்திரங்கள்",
    "nav.cropPlanner": "அடுத்த பருவ பயிர் திட்டம்",
    "nav.weather": "வானிலை மற்றும் மழை முன்னறிவிப்பு",
    "nav.products": "பயிர் இருப்பு விவரம்",
    "nav.invoices": "பில் மற்றும் GST ரசீது",
    "nav.settings": "அமைப்புகள்",
    "nav.contact": "தொடர்பு கொள்ள & WhatsApp",
    "nav.copyright": "பதிப்புரிமை கொள்கை",
    "nav.logout": "வெளியேறு",
    "nav.openPlatform": "தளத்தைத் திறக்கவும்",

    "common.live": "நேரலை",
    "common.new": "புதிய",
    "common.save": "சேமி",
    "common.cancel": "ரத்துசெய்",
    "common.region": "பகுதி",
    "common.language": "மொழி",
    "common.activeRegion": "செயலில் உள்ள மாநிலம்",
  },

  te: {
    // Telugu
    "login.title": "కృషికనెక్ట్‌లోకి సైన్ ఇన్ చేయండి",
    "login.subtitle": "మీ వ్యవసాయ ప్రాంతాన్ని ఎంచుకోండి మరియు మొబైల్ OTP లేదా ఈమెయిల్‌తో లాగిన్ చేయండి.",
    "login.secureBadge": "సురక్షిత మండి లాగిన్",
    "login.regionPrompt": "వ్యవసాయ ప్రాంతం / రాష్ట్రం",
    "login.changeRegion": "రాష్ట్రాన్ని మార్చండి",
    "login.languagePrompt": "ప్రాధాన్య భాష",
    "login.mobileTab": "మొబైల్ & OTP",
    "login.emailTab": "ఈమెయిల్ & పాస్‌వర్డ్",
    "login.phoneLabel": "మొబైల్ సంఖ్య",
    "login.phonePlaceholder": "10 అంకెల మొబైల్ సంఖ్య",
    "login.sendOtp": "SMS OTP పంపండి",
    "login.sendingOtp": "SMS పంపబడుతోంది...",
    "login.enterOtp": "6 అంకెల OTP నమోదు చేయండి",
    "login.verifyOtp": "ధృవీకరించి ప్రవేశించండి",
    "login.verifyingOtp": "ధృవీకరించబడుతోంది...",
    "login.nameOptional": "మీ పేరు / ఫార్మ్ పేరు (ఐచ్ఛికం)",
    "login.namePlaceholder": "ఉదా: రమేష్ రావు / జై కిసాన్ ఫార్మ్",
    "login.resendOtp": "మళ్ళీ కోడ్ పంపండి",
    "login.resendIn": "{s} సెకన్లలో మళ్ళీ పంపండి",
    "login.emailLabel": "ఈమెయిల్ చిరునామా",
    "login.passwordLabel": "పాస్‌వర్డ్",
    "login.signInBtn": "డాష్‌బోర్డ్‌లోకి ప్రవేశించండి",
    "login.signingIn": "లాగిన్ అవుతోంది...",
    "login.demoFarmer": "1-క్లిక్ రైతు డెమో",
    "login.demoTrader": "1-క్లిక్ వ్యాపారి డెమో",
    "login.quickAccess": "లేదా తక్షణ 1-క్లిక్ డెమో ద్వారా ప్రవేశించండి",
    "login.needAccount": "ఖాతా లేదా?",
    "login.registerNow": "కొత్త ఖాతా నమోదు చేసుకోండి",
    "login.regionNotice": "మండి ధరలు మరియు APMC సమాచారం {region} ప్రకారం అందుబాటులో ఉంటాయి.",

    "nav.mandiIntelligence": "మండి సమాచారం",
    "nav.farmOperations": "వ్యవసాయ కార్యకలాపాలు",
    "nav.supportLegal": "మద్దతు & నిబంధనలు",
    "nav.dailyCropRates": "రోజువారీ పంట మార్కెట్ ధరలు",
    "nav.notifications": "వ్యవసాయ హెచ్చరికలు & నోటిఫికేషన్లు",
    "nav.rateTrends": "7 రోజుల ధర ధోరణులు",
    "nav.transportation": "రవాణా మరియు సరుకు రవాణా",
    "nav.buyers": "పంట కొనుగోలుదారుల జాబితా",
    "nav.dashboard": "రైతు డాష్‌బోర్డ్",
    "nav.soilHealth": "నేల ఆరోగ్య పరీక్ష",
    "nav.fertilizer": "ఎరువులు & సబ్సిడీ",
    "nav.coldStorage": "సమీప కోల్డ్ స్టోరేజ్",
    "nav.equipment": "వ్యవసాయ పరికరాలు మరియు యంత్రాలు",
    "nav.cropPlanner": "తదుపరి సీజన్ పంట ప్రణాళిక",
    "nav.weather": "వాతావరణం & వర్ష సూచన",
    "nav.products": "పంటల నిల్వ జాబితా",
    "nav.invoices": "బిల్లులు & GST ఇన్వాయిస్‌లు",
    "nav.settings": "సెట్టింగ్‌లు",
    "nav.contact": "సంప్రదించండి & WhatsApp",
    "nav.copyright": "కాపీరైట్ విధానం",
    "nav.logout": "లాగ్ అవుట్",
    "nav.openPlatform": "ప్లాట్‌ఫారమ్‌ను తెరవండి",

    "common.live": "లైవ్",
    "common.new": "కొత్త",
    "common.save": "భద్రపరచు",
    "common.cancel": "రద్దు",
    "common.region": "ప్రాంతం",
    "common.language": "భాష",
    "common.activeRegion": "క్రియాశీల రాష్ట్రం",
  },

  bn: {
    // Bengali (West Bengal)
    "login.title": "কৃষিকানেক্টে সাইন ইন করুন",
    "login.subtitle": "আপনার কৃষি অঞ্চল নির্বাচন করুন এবং মোবাইল OTP বা ইমেলের মাধ্যমে লগইন করুন।",
    "login.secureBadge": "নিরাপদ মান্ডি লগইন",
    "login.regionPrompt": "কৃষি অঞ্চল / রাজ্য",
    "login.changeRegion": "রাজ্য পরিবর্তন করুন",
    "login.languagePrompt": "পছন্দের ভাষা",
    "login.mobileTab": "মোবাইল ও OTP",
    "login.emailTab": "ইমেল ও পাসওয়ার্ড",
    "login.phoneLabel": "মোবাইল নম্বর",
    "login.phonePlaceholder": "১০ সংখ্যার মোবাইল নম্বর",
    "login.sendOtp": "SMS OTP পাঠান",
    "login.sendingOtp": "SMS পাঠানো হচ্ছে...",
    "login.enterOtp": "৬ সংখ্যার OTP লিখুন",
    "login.verifyOtp": "যাচাই করে প্রবেশ করুন",
    "login.verifyingOtp": "যাচাই করা হচ্ছে...",
    "login.nameOptional": "আপনার নাম / খামারের নাম (ঐচ্ছিক)",
    "login.namePlaceholder": "যেমন: রমেশ ঘোষ / জয় কিষাণ খামার",
    "login.resendOtp": "আবার কোড পাঠান",
    "login.resendIn": "{s} সেকেন্ড পর আবার পাঠান",
    "login.emailLabel": "ইমেল ঠিকানা",
    "login.passwordLabel": "পাসওয়ার্ড",
    "login.signInBtn": "ড্যাশবোর্ডে প্রবেশ করুন",
    "login.signingIn": "লগইন হচ্ছে...",
    "login.demoFarmer": "১-ক্লিক কৃষক ডেমো",
    "login.demoTrader": "১-ক্লিক ব্যবসায়ী ডেমো",
    "login.quickAccess": "অথবা তাৎক্ষণিক ১-ক্লিক ডেমো দিয়ে প্রবেশ করুন",
    "login.needAccount": "অ্যাকাউন্ট নেই?",
    "login.registerNow": "নতুন রেজিস্ট্রেশন করুন",
    "login.regionNotice": "মান্ডি দর এবং APMC তথ্য {region} অনুযায়ী দেখানো হবে।",

    "nav.mandiIntelligence": "মান্ডি তথ্য",
    "nav.farmOperations": "খামার পরিচালনা",
    "nav.supportLegal": "সহায়তা ও নীতি",
    "nav.dailyCropRates": "দৈনিক ফসলের মান্ডি দর",
    "nav.notifications": "কৃষি সতর্কতা এবং বিজ্ঞপ্তি",
    "nav.rateTrends": "৭ দিনের দর প্রবণতা",
    "nav.transportation": "পরিবহন ও মালবাহী সেবা",
    "nav.buyers": "ফসল ক্রেতাদের তালিকা",
    "nav.dashboard": "কৃষক ড্যাশবোর্ড",
    "nav.soilHealth": "মাটি স্বাস্থ্য পরীক্ষা",
    "nav.fertilizer": "সার ও ভর্তুকি",
    "nav.coldStorage": "নিকটবর্তী কোল্ড স্টোরেজ",
    "nav.equipment": "কৃষি সরঞ্জাম ও যন্ত্রপাতি",
    "nav.cropPlanner": "আগামী মরসুমের ফসল পরিকল্পনা",
    "nav.weather": "আবহাওয়া ও বৃষ্টির পূর্বাভাস",
    "nav.products": "ফসলের স্টক তালিকা",
    "nav.invoices": "বিল ও GST চালান",
    "nav.settings": "সেটিংস",
    "nav.contact": "যোগাযোগ ও WhatsApp",
    "nav.copyright": "কপিরাইট নীতি",
    "nav.logout": "লগ আউট",
    "nav.openPlatform": "প্ল্যাটফর্ম খুলুন",

    "common.live": "লাইভ",
    "common.new": "নতুন",
    "common.save": "সংরক্ষণ",
    "common.cancel": "বাতিল",
    "common.region": "অঞ্চল",
    "common.language": "ভাষা",
    "common.activeRegion": "সক্রিয় রাজ্য",
  },

  ml: {
    // Malayalam (Kerala)
    "login.title": "കൃഷികണക്റ്റിൽ സൈൻ ഇൻ ചെയ്യുക",
    "login.subtitle": "നിങ്ങളുടെ കൃഷി പ്രദേശം തിരഞ്ഞെടുത്ത് മൊബൈൽ OTP അല്ലെങ്കിൽ ഇമെയിൽ വഴി ലോഗിൻ ചെയ്യുക.",
    "login.secureBadge": "സുരക്ഷിത മണ്ടി ലോഗിൻ",
    "login.regionPrompt": "കൃഷി പ്രദേശം / സംസ്ഥാനം",
    "login.changeRegion": "സംസ്ഥാനം മാറ്റുക",
    "login.languagePrompt": "തിരഞ്ഞെടുത്ത ഭാഷ",
    "login.mobileTab": "മൊബൈൽ & OTP",
    "login.emailTab": "ഇമെയിൽ & പാസ്‌വേഡ്",
    "login.phoneLabel": "മൊബൈൽ നമ്പർ",
    "login.phonePlaceholder": "10 അക്ക മൊബൈൽ നമ്പർ",
    "login.sendOtp": "SMS OTP അയക്കുക",
    "login.sendingOtp": "SMS അയക്കുന്നു...",
    "login.enterOtp": "6 അക്ക OTP രേഖപ്പെടുത്തുക",
    "login.verifyOtp": "പരിശോധിച്ച് പ്രവേശിക്കുക",
    "login.verifyingOtp": "പരിശോധിക്കുന്നു...",
    "login.nameOptional": "നിങ്ങളുടെ പേര് / ഫാമിന്റെ പേര് (ഐച്ഛികം)",
    "login.namePlaceholder": "ഉദാ: രമേഷ് മേനോൻ / ജയ് കിസാൻ ഫാം",
    "login.resendOtp": "വീണ്ടും കോഡ് അയക്കുക",
    "login.resendIn": "{s} സെക്കൻഡിൽ വീണ്ടും അയക്കാം",
    "login.emailLabel": "ഇമെയിൽ വിലാസം",
    "login.passwordLabel": "പാസ്‌വേഡ്",
    "login.signInBtn": "ഡാഷ്‌ബോർഡിലേക്ക് പ്രവേശിക്കുക",
    "login.signingIn": "ലോഗിൻ ചെയ്യുന്നു...",
    "login.demoFarmer": "1-ക്ലിക്ക് കർഷക ഡെമോ",
    "login.demoTrader": "1-ക്ലിക്ക് വ്യാപാരി ഡെമോ",
    "login.quickAccess": "അല്ലെങ്കിൽ 1-ക്ലിക്ക് ഡെമോ ഉപയോഗിക്കുക",
    "login.needAccount": "അക്കൗണ്ട് ഇല്ലേ?",
    "login.registerNow": "പുതിയ അക്കൗണ്ട് തുറക്കുക",
    "login.regionNotice": "വിപണി നിരക്കുകളും APMC വിവരങ്ങളും {region} അനുസരിച്ച് ക്രമീകരിക്കും.",

    "nav.mandiIntelligence": "വിപണി വിവരങ്ങൾ",
    "nav.farmOperations": "കൃഷി പ്രവർത്തനങ്ങൾ",
    "nav.supportLegal": "സഹായവും നിയമങ്ങളും",
    "nav.dailyCropRates": "ദിവസേനയുള്ള വിള നിരക്കുകൾ",
    "nav.notifications": "കാർഷിക മുന്നറിയിപ്പുകളും അറിയിപ്പുകളും",
    "nav.rateTrends": "7 ദിവസത്തെ നിരക്ക് ട്രെൻഡുകൾ",
    "nav.transportation": "ഗതാഗതവും ചരക്കുനീക്കവും",
    "nav.buyers": "വിള വാങ്ങുന്നവരുടെ ഡയറക്ടറി",
    "nav.dashboard": "കർഷക ഡാഷ്‌ബോർഡ്",
    "nav.soilHealth": "മണ്ണ് പരിശോധന",
    "nav.fertilizer": "വളം & സബ്‌സിഡി",
    "nav.coldStorage": "സമീപത്തെ കോൾഡ് സ്റ്റോറേജ്",
    "nav.equipment": "കാർഷിക ഉപകരണങ്ങൾ",
    "nav.cropPlanner": "അടുത്ത സീസൺ പ്ലാനർ",
    "nav.weather": "കാലാവസ്ഥയും മഴയും",
    "nav.products": "വിളകളുടെ സ്റ്റോക്ക് വിവരങ്ങൾ",
    "nav.invoices": "ബില്ലുകളും GST ഇൻവോയ്സും",
    "nav.settings": "ക്രമീകരണങ്ങൾ",
    "nav.contact": "ബന്ധപ്പെടുക & WhatsApp",
    "nav.copyright": "പകർപ്പവകാശ നയം",
    "nav.logout": "ലോഗ് ഔട്ട്",
    "nav.openPlatform": "പ്ലാറ്റ്‌ഫോം തുറക്കുക",

    "common.live": "ലൈവ്",
    "common.new": "പുതിയത്",
    "common.save": "സംരക്ഷിക്കുക",
    "common.cancel": "റദ്ദാക്കുക",
    "common.region": "പ്രദേശം",
    "common.language": "ഭാഷ",
    "common.activeRegion": "സജീവ സംസ്ഥാനം",
  },
};

export type GeolocationStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable"
  | "error";

export interface UserGpsLocation {
  lat: number;
  lon: number;
  locality: string;
  district: string;
  state: string;
  address: string;
  nearestMandi: MandiLocation;
  distanceKm: number;
  updatedAt: number;
}

interface LanguageContextType {
  region: RegionId;
  setRegion: (region: RegionId) => void;
  selectedState: string;
  selectedPlaceId: string;
  selectedMandiObj: MandiLocation;
  setRegionAndPlace: (state: string, placeIdOrName?: string) => void;
  userLocation: UserGpsLocation | null;
  isUsingLiveGps: boolean;
  locationStatus: GeolocationStatus;
  locationError: string | null;
  requestLocationAccess: (force?: boolean) => Promise<void>;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  availableLanguages: LanguageCode[];
  currentRegionDef: RegionDefinition;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY_REGION = "krishi_user_region";
const STORAGE_KEY_LANG = "krishi_user_lang";
const STORAGE_KEY_STATE = "krishi_user_state";
const STORAGE_KEY_PLACE = "krishi_user_place";
const STORAGE_KEY_GPS = "krishi_user_gps_v1";
const STORAGE_KEY_GPS_DISMISSED = "krishi_user_gps_dismissed";

// In-memory registry of original DOM text to allow clean reversal
const originalTextMap = new WeakMap<Node, string>();

/**
 * Universal phrase translations mapped directly to common phrases across KrishiConnect.
 * Operates purely in-browser without any third-party scripts, external iframes, or banners.
 */
export const PHRASE_DICTIONARY: Record<LanguageCode, Record<string, string>> = {
  en: {},
  or: {
    "Sovereign trade at the farm gate.": "ଫାର୍ମ ଗେଟ୍‌ରେ ସ୍ୱାଧୀନ ବାଣିଜ୍ୟ।",
    "Odisha agricultural commerce simplified: verified daily mandi modal prices, calibrated freight routing, and instant digital GST billing for farmers and traders.":
      "ଓଡ଼ିଶା କୃଷି ବାଣିଜ୍ୟ ସରଳୀକୃତ: ଯାଞ୍ଚ ହୋଇଥିବା ଦୈନିକ ମଣ୍ଡି ମୋଡାଲ୍ ଦର, ପରିବହନ ରୁଟ୍ ଏବଂ ତତକ୍ଷଣାତ୍ ଡିଜିଟାଲ୍ GST ବିଲ୍।",
    "Bhubaneswar APMC Live": "ଭୁବନେଶ୍ୱର ମଣ୍ଡି ଲାଇଭ୍",
    "APMC Live": "ମଣ୍ଡି ଲାଇଭ୍",
    "Daily Crop Rates": "ଦୈନିକ ଫସଲ ଦର",
    "7-Day Rate Trends": "୭ ଦିନର ଦର ଟ୍ରେଣ୍ଡ୍",
    "Freight & Routes": "ପରିବହନ ଓ ରୁଟ୍",
    "Transportation": "ପରିବହନ ସେବା",
    "Logistics": "ମାଲ ପରିବହନ",
    "GST Billing": "GST ବିଲିଂ",
    "Instant digital invoices": "ତତକ୍ଷଣାତ୍ ଡିଜିଟାଲ୍ ବିଲ୍",
    "Trade Buyers": "ଫସଲ କ୍ରେତା",
    "Crop Buyers": "ଫସଲ କ୍ରେତା",
    "Buyers": "କ୍ରେତା",
    "Directory & ledger": "ତାଲିକା ଓ ଖାତା",
    "Live Odisha APMC": "ଲାଇଭ୍ ଓଡ଼ିଶା ମଣ୍ଡି",
    "Distance & Rates": "ଦୂରତା ଓ ଭଡ଼ା",
    "Check Mandi Rates": "ମଣ୍ଡି ଦର ଦେଖନ୍ତୁ",
    "Mandi Rates": "ମଣ୍ଡି ଦର",
    "Season Planner": "ଋତୁ ଯୋଜନା",
    "Next Season Planner": "ଆଗାମୀ ଋତୁ ଯୋଜନା",
    "Weather & Rain": "ପାଣିପାଗ ଓ ବର୍ଷା",
    "Farm Weather & Map": "ପାଣିପାଗ ମାନଚିତ୍ର",
    "Weather": "ପାଣିପାଗ",
    "Invoices & Billing": "ଇନଭଏସ୍ ଓ ବିଲିଂ",
    "Invoices": "ବିଲ୍ / ଇନଭଏସ୍",
    "Soil Health Check": "ମୃତ୍ତିକା ସ୍ୱାସ୍ଥ୍ୟ ପରୀକ୍ଷା",
    "Soil Health": "ମୃତ୍ତିକା ସ୍ୱାସ୍ଥ୍ୟ",
    "Cold Storage": "କୋଲ୍ଡ ଷ୍ଟୋରେଜ୍",
    "Crops Inventory": "ଫସଲ ଷ୍ଟକ୍ ତାଲିକା",
    "Settings": "ସେଟିଂସ୍",
    "Support & Legal": "ସହାୟତା ଓ ନୀତି",
    "Contact Us": "ଯୋଗାଯୋଗ କରନ୍ତୁ",
    "Contact Support & WhatsApp": "ସହାୟତା ଓ ହ୍ୱାଟ୍ସଆପ୍",
    "Open Platform": "ପ୍ଲାଟଫର୍ମ ଖୋଲନ୍ତୁ",
    "Enter Platform": "ପ୍ଲାଟଫର୍ମ ପ୍ରବେଶ",
    "Dashboard": "ଡ୍ୟାସବୋର୍ଡ",
    "Farmer Dashboard": "କୃଷକ ଡ୍ୟାସବୋର୍ଡ",
    "Sign in to KrishiConnect": "କୃଷିକନେକ୍ଟରେ ସାଇନ୍ ଇନ୍ କରନ୍ତୁ",
    "Join KrishiConnect": "କୃଷିକନେକ୍ଟରେ ଯୋଡ଼ି ହୁଅନ୍ତୁ",
    "Secure Sign In": "ସୁରକ୍ଷିତ ଲଗଇନ୍",
    "Mobile Number": "ମୋବାଇଲ୍ ନମ୍ବର",
    "Verification Code": "ଯାଞ୍ଚ କୋଡ୍",
    "Send Verification OTP": "OTP ପଠାନ୍ତୁ",
    "Send SMS OTP": "SMS OTP ପଠାନ୍ତୁ",
    "Verify & Enter Platform": "ଯାଞ୍ଚ କରି ପ୍ରବେଶ କରନ୍ତୁ",
    "Email Address": "ଇମେଲ୍ ଠିକଣା",
    "Password": "ପାସୱାର୍ଡ",
    "Sign in with Email": "ଇମେଲ୍ ଦ୍ୱାରା ଲଗଇନ୍ କରନ୍ତୁ",
    "1-Click Instant Demo Login:": "୧-କ୍ଲିକ୍ ତତକ୍ଷଣାତ୍ ଡେମୋ:",
    "Demo Farmer": "ଚାଷୀ ଡେମୋ",
    "Demo Trader": "ବ୍ୟବସାୟୀ ଡେମୋ",
    "Don't have an account?": "ଖାତା ନାହିଁ କି?",
    "New to KrishiConnect?": "ନୂଆ ଖାତା ଖୋଲିବେ କି?",
    "Create new account": "ନୂଆ ଖାତା ଖୋଲନ୍ତୁ",
    "Register your farm business": "ନୂତନ ପଞ୍ଜୀକରଣ କରନ୍ତୁ",
    "Total Revenue": "ମୋଟ ଆୟ",
    "Active Invoices": "ସକ୍ରିୟ ବିଲ୍",
    "Recent Transactions": "ସାମ୍ପ୍ରତିକ କାରବାର",
    "Recent Invoices": "ସାମ୍ପ୍ରତିକ ଇନଭଏସ୍",
    "Commodity": "ଫସଲ",
    "Variety": "କିସମ",
    "Market": "ମଣ୍ଡି",
    "Min Price": "ସର୍ବନିମ୍ନ ଦର",
    "Max Price": "ସର୍ବାଧିକ ଦର",
    "Modal Price": "ମୋଡାଲ୍ ଦର",
    "Arrival Date": "ଆଗମନ ତାରିଖ",
    "District": "ଜିଲ୍ଲା",
    "Action": "କାର୍ଯ୍ୟ",
    "Actions": "କାର୍ଯ୍ୟ",
    "Search": "ଖୋଜନ୍ତୁ",
    "Filter": "ଫିଲ୍ଟର୍",
    "Download PDF": "PDF ଡାଉନଲୋଡ୍",
    "Log Out": "ଲଗ୍ ଆଉଟ୍",
    "Logout": "ଲଗ୍ ଆଉଟ୍",
  },
  hi: {
    "Sovereign trade at the farm gate.": "फार्म गेट पर संप्रभु व्यापार।",
    "Odisha agricultural commerce simplified: verified daily mandi modal prices, calibrated freight routing, and instant digital GST billing for farmers and traders.":
      "कृषि व्यापार हुआ आसान: दैनिक सत्यापित मंडी मॉडल भाव, सटीक मालभाड़ा और किसानों व व्यापारियों के लिए डिजिटल GST बिलिंग।",
    "Bhubaneswar APMC Live": "भुवनेश्वर मंडी लाइव",
    "APMC Live": "मंडी लाइव",
    "Daily Crop Rates": "दैनिक फसल मंडी भाव",
    "7-Day Rate Trends": "7 दिवसीय भाव रुझान",
    "Freight & Routes": "भाड़ा और रूट",
    "Transportation": "परिवहन सेवा",
    "Logistics": "लॉजिस्टिक्स",
    "GST Billing": "GST बिलिंग",
    "Instant digital invoices": "त्वरित डिजिटल बिल",
    "Trade Buyers": "फसल खरीदार",
    "Crop Buyers": "फसल खरीदार",
    "Buyers": "खरीदार",
    "Directory & ledger": "डायरेक्टरी व खाता",
    "Live Odisha APMC": "लाइव मंडी भाव",
    "Distance & Rates": "दूरी व भाड़ा",
    "Check Mandi Rates": "मंडी भाव देखें",
    "Mandi Rates": "मंडी भाव",
    "Season Planner": "मौसम फसल योजना",
    "Next Season Planner": "अगले सीजन की योजना",
    "Weather & Rain": "मौसम व बारिश",
    "Farm Weather & Map": "मौसम मानचित्र",
    "Weather": "मौसम",
    "Invoices & Billing": "चालान व बिलिंग",
    "Invoices": "चालान / बिल",
    "Soil Health Check": "मिट्टी स्वास्थ्य जांच",
    "Soil Health": "मृदा स्वास्थ्य",
    "Cold Storage": "कोल्ड स्टोरेज",
    "Crops Inventory": "फसल स्टॉक सूची",
    "Settings": "सेटिंग्स",
    "Support & Legal": "सहायता व नीतियां",
    "Contact Us": "संपर्क करें",
    "Contact Support & WhatsApp": "सहायता व WhatsApp",
    "Open Platform": "प्लेटफॉर्म खोलें",
    "Enter Platform": "प्लेटफॉर्म में प्रवेश करें",
    "Dashboard": "डैशबोर्ड",
    "Farmer Dashboard": "किसान डैशबोर्ड",
    "Sign in to KrishiConnect": "कृषिकनेक्ट में साइन इन करें",
    "Join KrishiConnect": "कृषिकनेक्ट से जुड़ें",
    "Secure Sign In": "सुरक्षित लॉगिन",
    "Mobile Number": "मोबाइल नंबर",
    "Verification Code": "सत्यापन कोड",
    "Send Verification OTP": "OTP भेजें",
    "Send SMS OTP": "SMS OTP भेजें",
    "Verify & Enter Platform": "सत्यापित कर प्रवेश करें",
    "Email Address": "ईमेल पता",
    "Password": "पासवर्ड",
    "Sign in with Email": "ईमेल से साइन इन करें",
    "1-Click Instant Demo Login:": "1-क्लिक त्वरित डेमो लॉगिन:",
    "Demo Farmer": "किसान डेमो",
    "Demo Trader": "व्यापारी डेमो",
    "Don't have an account?": "खाता नहीं है?",
    "New to KrishiConnect?": "नया खाता बनाना चाहते हैं?",
    "Create new account": "नया खाता बनाएं",
    "Register your farm business": "नया व्यापार पंजीकृत करें",
    "Total Revenue": "कुल राजस्व",
    "Active Invoices": "सक्रिय चालान",
    "Recent Transactions": "हालिया लेन-देन",
    "Recent Invoices": "हालिया चालान",
    "Commodity": "फसल / उपज",
    "Variety": "किस्म",
    "Market": "मंडी",
    "Min Price": "न्यूनतम भाव",
    "Max Price": "अधिकतम भाव",
    "Modal Price": "मॉडल भाव",
    "Arrival Date": "आगमन तिथि",
    "District": "ज़िला",
    "Action": "कार्रवाई",
    "Actions": "कार्रवाई",
    "Search": "खोजें",
    "Filter": "फ़िल्टर",
    "Download PDF": "PDF डाउनलोड",
    "Log Out": "लॉग आउट",
    "Logout": "लॉग आउट",
  },
  mr: {
    "Sovereign trade at the farm gate.": "शेतकऱ्यांच्या बांधावर थेट व पारदर्शक व्यापार.",
    "Bhubaneswar APMC Live": "कृषी उत्पन्न बाजार समिती थेट",
    "APMC Live": "बाजार समिती थेट",
    "Daily Crop Rates": "दैनिक बाजार भाव",
    "7-Day Rate Trends": "७ दिवसांचे भाव ट्रेंड",
    "Freight & Routes": "वाहतूक व भाडे",
    "Transportation": "वाहतूक व्यवस्था",
    "Logistics": "लॉजिस्टिक्स",
    "GST Billing": "GST बिलिंग",
    "Instant digital invoices": "त्वरित डिजिटल बिले",
    "Trade Buyers": "शेतमाल खरेदीदार",
    "Crop Buyers": "शेतमाल खरेदीदार",
    "Buyers": "खरेदीदार",
    "Check Mandi Rates": "बाजार भाव पहा",
    "Mandi Rates": "बाजार भाव",
    "Season Planner": "हंगाम नियोजन",
    "Weather & Rain": "हवामान व पाऊस",
    "Invoices & Billing": "बिले व बिलिंग",
    "Soil Health Check": "मृदा आरोग्य तपासणी",
    "Cold Storage": "कोल्ड स्टोरेज (शीतगृह)",
    "Crops Inventory": "शेतमाल साठा",
    "Settings": "सेटिंग्ज",
    "Open Platform": "प्लॅटफॉर्म उघडा",
    "Enter Platform": "प्रवेश करा",
    "Dashboard": "डॅशबोर्ड",
    "Farmer Dashboard": "शेतकरी डॅशबोर्ड",
    "Sign in to KrishiConnect": "कृषीकनेक्ट मध्ये साइन इन करा",
    "Total Revenue": "एकूण उत्पन्न",
    "Active Invoices": "सक्रिय बिले",
    "Recent Transactions": "अलीकडील व्यवहार",
    "Commodity": "शेतमाल",
    "Variety": "प्रकार",
    "Market": "बाजार",
    "Min Price": "किमान भाव",
    "Max Price": "कमाल भाव",
    "Modal Price": "सरासरी भाव",
    "Arrival Date": "आवक दिनांक",
    "Search": "शोधा",
    "Filter": "फिल्टर",
    "Log Out": "लॉग आउट",
  },
  pa: {
    "Sovereign trade at the farm gate.": "ਫਾਰਮ ਗੇਟ 'ਤੇ ਕਿਸਾਨਾਂ ਦਾ ਸੁਤੰਤਰ ਵਪਾਰ।",
    "Bhubaneswar APMC Live": "ਮੰਡੀ ਲਾਈਵ",
    "Daily Crop Rates": "ਰੋਜ਼ਾਨਾ ਮੰਡੀ ਭਾਅ",
    "7-Day Rate Trends": "7 ਦਿਨਾਂ ਦੇ ਭਾਅ ਰੁਝਾਨ",
    "Transportation": "ਟਰਾਂਸਪੋਰਟ ਸੇਵਾ",
    "Logistics": "ਢੋਆ-ਢੁਆਈ",
    "GST Billing": "GST ਬਿਲਿੰਗ",
    "Trade Buyers": "ਫਸਲ ਖਰੀਦਦਾਰ",
    "Crop Buyers": "ਫਸਲ ਖਰੀਦਦਾਰ",
    "Check Mandi Rates": "ਮੰਡੀ ਭਾਅ ਦੇਖੋ",
    "Mandi Rates": "ਮੰਡੀ ਭਾਅ",
    "Season Planner": "ਸੀਜ਼ਨ ਪਲਾਨਰ",
    "Weather & Rain": "ਮੌਸਮ ਅਤੇ ਮੀਂਹ",
    "Invoices": "ਬਿੱਲ / ਚਲਾਨ",
    "Soil Health Check": "ਮਿੱਟੀ ਦੀ ਪਰਖ",
    "Cold Storage": "ਕੋਲਡ ਸਟੋਰੇਜ",
    "Open Platform": "ਪਲੇਟਫਾਰਮ ਖੋਲ੍ਹੋ",
    "Dashboard": "ਕਿਸਾਨ ਡੈਸ਼ਬੋਰਡ",
    "Total Revenue": "ਕੁੱਲ ਕਮਾਈ",
    "Commodity": "ਫਸਲ",
    "Variety": "ਕਿਸਮ",
    "Modal Price": "ਮਾਡਲ ਭਾਅ",
    "Log Out": "ਲੌਗ ਆਉਟ",
  },
  gu: {
    "Sovereign trade at the farm gate.": "ખેતરે બેઠા વેપારની સંપૂર્ણ સ્વતંત્રતા.",
    "Daily Crop Rates": "દૈનિક પાક બજાર ભાવ",
    "7-Day Rate Trends": "૭ દિવસના ભાવ વલણો",
    "Transportation": "વાહન વ્યવહાર",
    "Check Mandi Rates": "મંડી ભાવ જુઓ",
    "Mandi Rates": "મંડી ભાવ",
    "Dashboard": "ખેડૂત ડેશબોર્ડ",
    "Soil Health Check": "જમીન ચકાસણી",
    "Open Platform": "પ્લેટફોર્મ ખોલો",
    "Commodity": "પાક",
    "Modal Price": "મોડલ ભાવ",
    "Log Out": "લૉગ આઉટ",
  },
  kn: {
    "Sovereign trade at the farm gate.": "ರೈತರ ಜಮೀನಿನಲ್ಲೇ ಸ್ವತಂತ್ರ ಕೃಷಿ ವ್ಯಾಪಾರ.",
    "Daily Crop Rates": "ದೈನಂದಿನ ಬೆಳೆ ಮಾರುಕಟ್ಟೆ ದರ",
    "Mandi Rates": "ಮಾರುಕಟ್ಟೆ ದರಗಳು",
    "Dashboard": "ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "Soil Health Check": "ಮಣ್ಣಿನ ಆರೋಗ್ಯ ತಪಾಸಣೆ",
    "Open Platform": "ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ತೆರೆಯಿರಿ",
    "Commodity": "ಬೆಳೆ",
    "Modal Price": "ಮಾದರಿ ದರ",
    "Log Out": "ಲಾಗ್ ಔಟ್",
  },
  ta: {
    "Sovereign trade at the farm gate.": "விவசாயிகளின் பண்ணையிலேயே நேரடி வர்த்தகம்.",
    "Daily Crop Rates": "தினசரி பயிர் சந்தை விலை",
    "Mandi Rates": "சந்தை விலைகள்",
    "Dashboard": "விவசாயி டாஷ்போர்டு",
    "Soil Health Check": "மண் பரிசோதனை",
    "Open Platform": "தளத்தைத் திறக்கவும்",
    "Commodity": "பயிர்",
    "Modal Price": "சராசரி விலை",
    "Log Out": "வெளியேறு",
  },
  te: {
    "Sovereign trade at the farm gate.": "రైతు ముంగిట స్వతంత్ర వ్యవసాయ వాణిజ్యం.",
    "Daily Crop Rates": "రోజువారీ పంట మార్కెట్ ధరలు",
    "Mandi Rates": "మార్కెట్ ధరలు",
    "Dashboard": "రైతు డాష్‌బోర్డ్",
    "Soil Health Check": "నేల ఆరోగ్య పరీక్ష",
    "Open Platform": "ప్లాట్‌ఫారమ్‌ను తెరవండి",
    "Commodity": "పంట",
    "Modal Price": "మోడల్ ధర",
    "Log Out": "లాగ్ అవుట్",
  },
  bn: {
    "Sovereign trade at the farm gate.": "খামারের দরজায় স্বাধীন কৃষি বাণিজ্য।",
    "Daily Crop Rates": "দৈনিক ফসলের মান্ডি দর",
    "Mandi Rates": "মান্ডি দর",
    "Dashboard": "কৃষক ড্যাশবোর্ড",
    "Soil Health Check": "মাটি স্বাস্থ্য পরীক্ষা",
    "Open Platform": "প্ল্যাটফর্ম খুলুন",
    "Commodity": "ফসল",
    "Modal Price": "মডেল দর",
    "Log Out": "লগ আউট",
  },
  ml: {
    "Sovereign trade at the farm gate.": "കർഷകന്റെ കൃഷിയിടത്തിൽ തന്നെ സ്വതന്ത്ര വ്യാപാരം.",
    "Daily Crop Rates": "ദിവസേനയുള്ള വിപണി നിരക്കുകൾ",
    "Mandi Rates": "വിപണി നിരക്കുകൾ",
    "Dashboard": "കർഷക ഡാഷ്‌ബോർഡ്",
    "Soil Health Check": "മണ്ണ് പരിശോധന",
    "Open Platform": "പ്ലാറ്റ്‌ഫോം തുറക്കുക",
    "Commodity": "വിള",
    "Modal Price": "മോഡൽ നിരക്ക്",
    "Log Out": "ലോഗ് ഔട്ട്",
  },
};

/**
 * Native, zero-dependency client-side DOM translation.
 * Translates visible phrases in the DOM in real-time with zero external scripts,
 * zero network requests, and zero ugly banners!
 */
export function applyNativeSiteTranslation(targetLang: LanguageCode) {
  if (typeof window === "undefined" || !document.body) return;

  // 1. Immediately clean up and destroy any rogue Google Translate artifacts/iframes
  try {
    const rogue = document.querySelectorAll(
      'iframe[class*="goog"], iframe[name*="goog"], .goog-te-banner-frame, #google_translate_element, .skiptranslate, #goog-gt-tt, .goog-te-balloon-frame'
    );
    rogue.forEach((el) => el.remove());
    document.body.style.top = "0px";
    document.body.classList.remove("translated-ltr", "translated-rtl");

    // Clear legacy googtrans cookies
    const host = window.location.hostname;
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${host}; path=/;`;
    if (host !== "localhost" && !host.startsWith("127.")) {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${host}; path=/;`;
    }
  } catch (e) {}

  // 2. Prepare dictionary replacements
  const dict = PHRASE_DICTIONARY[targetLang] || {};
  const phrases = Object.keys(dict).sort((a, b) => b.length - a.length);

  // 3. Walk all text nodes in the DOM
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName.toLowerCase();
        if (
          tag === "script" ||
          tag === "style" ||
          tag === "code" ||
          tag === "pre" ||
          tag === "textarea" ||
          tag === "input" ||
          parent.isContentEditable
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  let currentNode: Node | null = walker.nextNode();
  while (currentNode) {
    // Record original text on first visit
    if (!originalTextMap.has(currentNode)) {
      originalTextMap.set(currentNode, currentNode.nodeValue || "");
    }

    const original = originalTextMap.get(currentNode) || "";

    if (targetLang === "en") {
      // Revert cleanly to original English text
      if (currentNode.nodeValue !== original) {
        currentNode.nodeValue = original;
      }
    } else {
      let replaced = original;
      if (phrases.length > 0) {
        for (const phrase of phrases) {
          if (replaced.includes(phrase)) {
            replaced = replaced.split(phrase).join(dict[phrase]);
          }
        }
      }
      if (currentNode.nodeValue !== replaced) {
        currentNode.nodeValue = replaced;
      }
    }

    currentNode = walker.nextNode();
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { businessProfile } = useAuth();
  const [region, setRegionState] = useState<RegionId>("odisha");
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [selectedState, setSelectedState] = useState<string>("Odisha");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>("bhubaneswar");
  const [userLocation, setUserLocation] = useState<UserGpsLocation | null>(null);
  const [isUsingLiveGps, setIsUsingLiveGps] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<GeolocationStatus>("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const gpsAutoAttemptedRef = useRef(false);
  const pathname = usePathname();

  const applyGpsLocation = useCallback((loc: UserGpsLocation) => {
    setUserLocation(loc);
    setIsUsingLiveGps(true);
    setLocationStatus("granted");
    setLocationError(null);

    const normalizedState = normalizeIndianState(loc.state) || loc.nearestMandi.state || "Odisha";
    const regId = stateToRegionId(normalizedState) as RegionId;
    setSelectedState(normalizedState);
    setSelectedPlaceId(loc.nearestMandi.id);
    if (REGIONS[regId]) {
      setRegionState(regId);
    }

    try {
      localStorage.setItem(STORAGE_KEY_GPS, JSON.stringify(loc));
      localStorage.setItem(STORAGE_KEY_STATE, normalizedState);
      localStorage.setItem(STORAGE_KEY_PLACE, loc.nearestMandi.id);
      if (REGIONS[regId]) {
        localStorage.setItem(STORAGE_KEY_REGION, regId);
      }
      localStorage.removeItem(STORAGE_KEY_GPS_DISMISSED);
    } catch {}
  }, []);

  const requestLocationAccess = useCallback(async (force = false) => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setLocationStatus("unavailable");
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    if (force) {
      try {
        localStorage.removeItem(STORAGE_KEY_GPS_DISMISSED);
      } catch {}
    }

    setLocationStatus("requesting");
    setLocationError(null);

    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const fallbackNearest = findNearestMandi(lat, lon);

          let resolvedLoc: UserGpsLocation = {
            lat,
            lon,
            locality: fallbackNearest.mandi.district,
            district: fallbackNearest.mandi.district,
            state: fallbackNearest.mandi.state,
            address: `Near ${fallbackNearest.mandi.name}, ${fallbackNearest.mandi.state}`,
            nearestMandi: fallbackNearest.mandi,
            distanceKm: fallbackNearest.distanceKm,
            updatedAt: Date.now(),
          };

          try {
            const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
            if (res.ok) {
              const geo = await res.json();
              if (geo?.success) {
                resolvedLoc = {
                  lat,
                  lon,
                  locality: geo.locality || geo.city || fallbackNearest.mandi.district,
                  district: geo.district || fallbackNearest.mandi.district,
                  state: normalizeIndianState(geo.state) || fallbackNearest.mandi.state,
                  address: geo.address || resolvedLoc.address,
                  nearestMandi: geo.nearestMandi || fallbackNearest.mandi,
                  distanceKm: typeof geo.distanceKm === "number" ? geo.distanceKm : fallbackNearest.distanceKm,
                  updatedAt: Date.now(),
                };
              }
            }
          } catch (geoErr) {
            console.warn("Reverse geocode fallback active:", geoErr);
          }

          applyGpsLocation(resolvedLoc);
          resolve();
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            setLocationStatus("denied");
            setLocationError("Location permission denied. Enable browser location to view local map & data.");
            try {
              localStorage.setItem(STORAGE_KEY_GPS_DISMISSED, "1");
            } catch {}
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            setLocationStatus("unavailable");
            setLocationError("GPS signal unavailable. Using selected region.");
          } else {
            setLocationStatus("error");
            setLocationError(err.message || "Could not fetch your current location.");
          }
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: force ? 0 : 300000,
        }
      );
    });
  }, [applyGpsLocation]);

  // Load from localStorage on mount & initialize Native DOM translation
  useEffect(() => {
    try {
      const savedRegion = localStorage.getItem(STORAGE_KEY_REGION) as RegionId | null;
      const savedLang = localStorage.getItem(STORAGE_KEY_LANG) as LanguageCode | null;
      const savedState = localStorage.getItem(STORAGE_KEY_STATE);
      const savedPlace = localStorage.getItem(STORAGE_KEY_PLACE);
      const savedGpsRaw = localStorage.getItem(STORAGE_KEY_GPS);

      let initialRegion: RegionId = "odisha";
      let initialLang: LanguageCode = "en";

      if (savedGpsRaw) {
        try {
          const parsedGps = JSON.parse(savedGpsRaw) as UserGpsLocation;
          if (parsedGps && Number.isFinite(parsedGps.lat) && Number.isFinite(parsedGps.lon)) {
            setUserLocation(parsedGps);
            setIsUsingLiveGps(true);
            setLocationStatus("granted");
            setSelectedState(parsedGps.state);
            setSelectedPlaceId(parsedGps.nearestMandi?.id || "bhubaneswar");
            const gpsReg = stateToRegionId(parsedGps.state) as RegionId;
            if (REGIONS[gpsReg]) initialRegion = gpsReg;
          }
        } catch {}
      }

      if (!savedGpsRaw && savedState && REGIONAL_MANDIS[savedState]) {
        setSelectedState(savedState);
        initialRegion = stateToRegionId(savedState) as RegionId;
        if (savedPlace) {
          setSelectedPlaceId(savedPlace);
        } else {
          setSelectedPlaceId(REGIONAL_MANDIS[savedState][0].id);
        }
      }

      if (savedRegion && REGIONS[savedRegion] && savedRegion !== "all_india") {
        initialRegion = savedRegion;
        const regionDef = REGIONS[savedRegion];
        initialLang = savedLang && regionDef.supportedLangs.includes(savedLang)
          ? savedLang
          : regionDef.defaultLang;
      }

      setRegionState(initialRegion);
      setLanguageState(initialLang);
      if (typeof document !== "undefined") {
        document.documentElement.lang = initialLang;
      }

      // Small delay to let initial React tree mount
      setTimeout(() => {
        applyNativeSiteTranslation(initialLang);
      }, 50);
    } catch (e) {
      console.warn("Could not read language preferences from localStorage", e);
    }
  }, []);

  // Automatically ask browser location permission when inside dashboard/map routes
  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;
    if (gpsAutoAttemptedRef.current) return;
    const isAuthOrLanding =
      !pathname || pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/register");
    if (isAuthOrLanding) return;

    gpsAutoAttemptedRef.current = true;

    const runAutoLocation = async () => {
      let dismissed = false;
      let cachedUpdatedAt = 0;
      try {
        dismissed = localStorage.getItem(STORAGE_KEY_GPS_DISMISSED) === "1";
        const raw = localStorage.getItem(STORAGE_KEY_GPS);
        if (raw) cachedUpdatedAt = JSON.parse(raw)?.updatedAt || 0;
      } catch {}

      const isCacheStale = Date.now() - cachedUpdatedAt > 15 * 60 * 1000;

      if (navigator.permissions && navigator.permissions.query) {
        try {
          const perm = await navigator.permissions.query({ name: "geolocation" as PermissionName });
          if (perm.state === "granted") {
            if (isCacheStale) {
              requestLocationAccess(false);
            }
          } else if (perm.state === "prompt" && !dismissed) {
            requestLocationAccess(false);
          } else if (perm.state === "denied") {
            setLocationStatus("denied");
          }
          return;
        } catch {}
      }

      if (!dismissed && isCacheStale) {
        requestLocationAccess(false);
      }
    };

    runAutoLocation();
  }, [pathname, requestLocationAccess]);

  // Sync with user's profile address when available (only when neither live GPS nor manual state exists)
  useEffect(() => {
    if (businessProfile?.address && !isUsingLiveGps) {
      const detected = detectRegionFromAddress(businessProfile.address);
      if (detected) {
        const savedState = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_STATE) : null;
        if (!savedState) {
          setSelectedState(detected.state);
          if (detected.placeId) setSelectedPlaceId(detected.placeId);
          const regId = stateToRegionId(detected.state) as RegionId;
          setRegionState(regId);
          try {
            localStorage.setItem(STORAGE_KEY_STATE, detected.state);
            if (detected.placeId) localStorage.setItem(STORAGE_KEY_PLACE, detected.placeId);
            localStorage.setItem(STORAGE_KEY_REGION, regId);
          } catch (e) {}
        }
      }
    }
  }, [businessProfile?.address, isUsingLiveGps]);

  // Re-apply native translation on route change in SPA
  useEffect(() => {
    if (language) {
      const timer = setTimeout(() => {
        applyNativeSiteTranslation(language);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [pathname, language]);

  // Set up a lightweight MutationObserver to translate dynamically rendered elements
  useEffect(() => {
    if (typeof window === "undefined" || !document.body || language === "en") return;

    let debounceTimer: any = null;
    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        applyNativeSiteTranslation(language);
      }, 120);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: false,
    });

    return () => {
      observer.disconnect();
      clearTimeout(debounceTimer);
    };
  }, [language]);

  const setRegion = (newRegion: RegionId) => {
    if (!REGIONS[newRegion]) return;
    setIsUsingLiveGps(false);
    setRegionState(newRegion);
    try {
      localStorage.setItem(STORAGE_KEY_REGION, newRegion);
    } catch (e) {}

    // Synchronize selectedState and selectedPlaceId with the region
    if (newRegion !== "all_india") {
      const st = regionIdToState(newRegion);
      if (REGIONAL_MANDIS[st]) {
        setSelectedState(st);
        const placeId = REGIONAL_MANDIS[st][0].id;
        setSelectedPlaceId(placeId);
        try {
          localStorage.setItem(STORAGE_KEY_STATE, st);
          localStorage.setItem(STORAGE_KEY_PLACE, placeId);
        } catch (e) {}
      }
    }

    const regionDef = REGIONS[newRegion];
    // If current selected language is not supported in the new region, adapt gracefully
    if (regionDef && !regionDef.supportedLangs.includes(language)) {
      setLanguage(regionDef.defaultLang);
    }
  };

  const setLanguage = (newLang: LanguageCode) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY_LANG, newLang);
      if (typeof document !== "undefined") {
        document.documentElement.lang = newLang;
      }
    } catch (e) {}

    applyNativeSiteTranslation(newLang);
  };

  const selectedMandiObj: MandiLocation = useMemo(() => {
    if (isUsingLiveGps && userLocation) {
      return {
        id: userLocation.nearestMandi.id,
        name: userLocation.locality
          ? `${userLocation.locality}`
          : userLocation.nearestMandi.name,
        state: userLocation.state,
        district: userLocation.district || userLocation.nearestMandi.district,
        lat: userLocation.lat,
        lon: userLocation.lon,
        address: userLocation.address,
      };
    }
    const list = REGIONAL_MANDIS[selectedState] || REGIONAL_MANDIS["Odisha"];
    return list.find((p) => p.id === selectedPlaceId) || list[0];
  }, [isUsingLiveGps, userLocation, selectedState, selectedPlaceId]);

  const setRegionAndPlace = (stateName: string, placeIdOrName?: string) => {
    const validState = REGIONAL_MANDIS[stateName] ? stateName : "Odisha";
    setIsUsingLiveGps(false);
    setSelectedState(validState);
    const list = REGIONAL_MANDIS[validState];

    let targetPlace = list[0];
    if (placeIdOrName) {
      const found = list.find(
        (p) => p.id === placeIdOrName || p.name.toLowerCase() === placeIdOrName.toLowerCase()
      );
      if (found) targetPlace = found;
    }
    setSelectedPlaceId(targetPlace.id);

    // Sync region ID for translations & language without clearing state selection
    const regId = stateToRegionId(validState) as RegionId;
    if (REGIONS[regId]) {
      setRegionState(regId);
      const regionDef = REGIONS[regId];
      if (regionDef && !regionDef.supportedLangs.includes(language)) {
        setLanguage(regionDef.defaultLang);
      }
    }

    try {
      localStorage.setItem(STORAGE_KEY_STATE, validState);
      localStorage.setItem(STORAGE_KEY_PLACE, targetPlace.id);
      if (REGIONS[regId]) localStorage.setItem(STORAGE_KEY_REGION, regId);
    } catch (e) {}
  };

  const currentRegionDef = REGIONS[region] || REGIONS.all_india || REGIONS.odisha;
  const availableLanguages = currentRegionDef.supportedLangs;

  // Translation helper with parameter interpolation and graceful fallbacks
  const t = (key: string, params?: Record<string, string | number>): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    let translation = langDict[key] || TRANSLATIONS.en[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramVal));
      });
    }

    return translation;
  };

  return (
    <LanguageContext.Provider
      value={{
        region,
        setRegion,
        selectedState,
        selectedPlaceId,
        selectedMandiObj,
        setRegionAndPlace,
        userLocation,
        isUsingLiveGps,
        locationStatus,
        locationError,
        requestLocationAccess,
        language,
        setLanguage,
        availableLanguages,
        currentRegionDef,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
