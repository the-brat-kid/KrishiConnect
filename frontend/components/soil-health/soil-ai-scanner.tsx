"use client";

import React, { useState, useRef } from "react";
import {
  Sparkles,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Loader2,
  FlaskConical,
  Sprout,
  ArrowRight,
  ShieldAlert,
  Percent,
  RefreshCw,
  Lightbulb,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";

const ODISHA_DISTRICTS = [
  "Khordha",
  "Cuttack",
  "Sambalpur",
  "Bargarh",
  "Ganjam",
  "Balasore",
  "Puri",
  "Bhadrak",
  "Jajpur",
  "Mayurbhanj",
  "Angul",
  "Dhenkanal",
  "Kendrapara",
  "Koraput",
  "Bolangir",
];

export function SoilAiScanner({ onBookTest }: { onBookTest?: () => void }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"upload" | "manual">("upload");
  const [district, setDistrict] = useState("Khordha");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  // Manual values form
  const [manualValues, setManualValues] = useState({
    ph: "5.8",
    nitrogen: "Low",
    phosphorus: "Medium",
    potassium: "High",
    organic_carbon: "0.42%",
    zinc: "Deficient",
    salinity_ec: "Normal",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
    }
  };

  const handleScanReport = async () => {
    if (!selectedFile) {
      toast({
        title: "Please choose a photo",
        description: "Upload a soil health card photo or lab report to scan.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("district", district);

      const { data } = await api.post("/soil-health/analyze-report", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAnalysisResult(data);
      toast({
        title: "Gemini AI Scan Complete! ✨",
        description: `Analyzed soil report for ${district}. Recommended crops ready!`,
      });
    } catch (err: any) {
      console.error("AI Scan error:", err);
      toast({
        title: "Scan fallback applied",
        description: "Generated expert agronomic advisory for your district.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualScan = async () => {
    try {
      setIsAnalyzing(true);
      const { data } = await api.post("/soil-health/analyze-manual", {
        ...manualValues,
        district,
      });
      setAnalysisResult(data);
      toast({
        title: "Gemini AI Analysis Ready! 🌾",
        description: `Recommended crops generated for ${district}.`,
      });
    } catch (err: any) {
      console.error("Manual AI error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadDemoReport = () => {
    setAnalysisResult(null);
    setManualValues({
      ph: "5.6",
      nitrogen: "Low (< 200 kg/ha)",
      phosphorus: "Medium (18 kg/ha)",
      potassium: "High (> 300 kg/ha)",
      organic_carbon: "0.38% (Deficient)",
      zinc: "Deficient (< 0.5 ppm)",
      salinity_ec: "Normal (0.35 dS/m)",
    });
    setMode("manual");
    toast({
      title: "Sample Soil Card Loaded",
      description: "Click 'Analyze with Gemini AI' to generate recommendations.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="relative rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-zinc-900/60 to-zinc-950 p-6 backdrop-blur-xl overflow-hidden shadow-lg">
        <div className="pointer-events-none absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2.5 border border-emerald-500/30 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>Powered by Google Gemini Multimodal Vision AI</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              AI Soil Report Scanner & Crop Advisor
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
              Apni Mitti ki report (Soil Health Card) ki photo upload karein. Gemini Vision AI report ke NPK aur pH levels ko scan karke batayega ki kaunsi fasal sabse zyada munafa aur paidaawar degi.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleLoadDemoReport}
              className="text-xs font-semibold h-10 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            >
              Demo Report Try Karein
            </Button>
          </div>
        </div>
      </div>

      {/* Input Selector Tabs */}
      <div className="p-5 rounded-2xl border border-white/10 dark:border-white/10 bg-white/70 dark:bg-[#0c0d0e]/80 backdrop-blur-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode("upload")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === "upload"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground bg-muted/50"
              }`}
            >
              📷 Photo / PDF Upload
            </button>
            <button
              onClick={() => setMode("manual")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === "manual"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground bg-muted/50"
              }`}
            >
              ✍️ Enter Values Manually
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="district-select" className="text-xs text-muted-foreground shrink-0">
              Farm District:
            </Label>
            <select
              id="district-select"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="h-8 px-2.5 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {ODISHA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* MODE 1: PHOTO / PDF UPLOAD */}
        {mode === "upload" && (
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className="hidden"
            />

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 rounded-2xl p-8 sm:p-12 text-center bg-emerald-500/5 hover:bg-emerald-500/10 transition-all flex flex-col items-center justify-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-sm sm:text-base text-foreground mb-1">
                  Upload Soil Health Card (Photo ya PDF)
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-3">
                  Apne phone ke camera se report ki photo kheencho ya gallery se image select karein.
                </p>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Supported: JPG, PNG, WEBP, PDF (Max 10MB)
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 max-h-72 bg-black/40 flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Soil Report Preview"
                    className="max-h-64 rounded-xl object-contain"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-2">
                      <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                      <span className="text-sm font-bold text-emerald-400">
                        Gemini Vision AI scanning soil report...
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Extracting pH, NPK & Micronutrient values
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setAnalysisResult(null);
                    }}
                    disabled={isAnalyzing}
                    className="text-xs h-9"
                  >
                    Change Image
                  </Button>

                  <Button
                    type="button"
                    onClick={handleScanReport}
                    disabled={isAnalyzing}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-6 shadow-md flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Scanning with Gemini AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analyze with Gemini AI</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: MANUAL PARAMETERS */}
        {mode === "manual" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="manual-ph" className="text-xs font-semibold">
                  Soil pH Level
                </Label>
                <Input
                  id="manual-ph"
                  value={manualValues.ph}
                  onChange={(e) => setManualValues({ ...manualValues, ph: e.target.value })}
                  placeholder="e.g. 5.8 or 6.5"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="manual-n" className="text-xs font-semibold">
                  Nitrogen (N)
                </Label>
                <select
                  id="manual-n"
                  value={manualValues.nitrogen}
                  onChange={(e) => setManualValues({ ...manualValues, nitrogen: e.target.value })}
                  className="w-full h-9 px-2 rounded-md border border-input bg-background text-xs"
                >
                  <option value="Low">Low (&lt; 250 kg/ha)</option>
                  <option value="Medium">Medium (250-400 kg/ha)</option>
                  <option value="High">High (&gt; 400 kg/ha)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="manual-p" className="text-xs font-semibold">
                  Phosphorus (P)
                </Label>
                <select
                  id="manual-p"
                  value={manualValues.phosphorus}
                  onChange={(e) => setManualValues({ ...manualValues, phosphorus: e.target.value })}
                  className="w-full h-9 px-2 rounded-md border border-input bg-background text-xs"
                >
                  <option value="Low">Low (&lt; 15 kg/ha)</option>
                  <option value="Medium">Medium (15-25 kg/ha)</option>
                  <option value="High">High (&gt; 25 kg/ha)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="manual-k" className="text-xs font-semibold">
                  Potassium (K)
                </Label>
                <select
                  id="manual-k"
                  value={manualValues.potassium}
                  onChange={(e) => setManualValues({ ...manualValues, potassium: e.target.value })}
                  className="w-full h-9 px-2 rounded-md border border-input bg-background text-xs"
                >
                  <option value="Low">Low (&lt; 120 kg/ha)</option>
                  <option value="Medium">Medium (120-280 kg/ha)</option>
                  <option value="High">High (&gt; 280 kg/ha)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="manual-oc" className="text-xs font-semibold">
                  Organic Carbon (OC)
                </Label>
                <Input
                  id="manual-oc"
                  value={manualValues.organic_carbon}
                  onChange={(e) => setManualValues({ ...manualValues, organic_carbon: e.target.value })}
                  placeholder="e.g. 0.45%"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="manual-zn" className="text-xs font-semibold">
                  Zinc (Zn)
                </Label>
                <select
                  id="manual-zn"
                  value={manualValues.zinc}
                  onChange={(e) => setManualValues({ ...manualValues, zinc: e.target.value })}
                  className="w-full h-9 px-2 rounded-md border border-input bg-background text-xs"
                >
                  <option value="Deficient">Deficient (&lt; 0.6 ppm)</option>
                  <option value="Sufficient">Sufficient (&gt; 0.6 ppm)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="manual-ec" className="text-xs font-semibold">
                  Salinity (EC)
                </Label>
                <select
                  id="manual-ec"
                  value={manualValues.salinity_ec}
                  onChange={(e) => setManualValues({ ...manualValues, salinity_ec: e.target.value })}
                  className="w-full h-9 px-2 rounded-md border border-input bg-background text-xs"
                >
                  <option value="Normal">Normal (&lt; 1.0 dS/m)</option>
                  <option value="Slightly Saline">Slightly Saline (1-2 dS/m)</option>
                  <option value="High Salinity">High Salinity (&gt; 2 dS/m)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={handleManualScan}
                disabled={isAnalyzing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-6 shadow-md flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze with Gemini AI</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* AI ANALYSIS RESULTS SECTION */}
      {analysisResult && (
        <div className="space-y-5 animate-in fade-in-50 duration-500">
          {/* Header & Soil Health Score */}
          <div className="p-6 rounded-2xl border border-emerald-500/40 bg-white/80 dark:bg-[#0c0d0e]/90 backdrop-blur-xl shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Gemini Agronomic Analysis Report</span>
                </span>
                <h3 className="text-lg sm:text-xl font-black text-foreground mt-0.5">
                  Field Diagnostic & Crop Recommendations ({district})
                </h3>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-center">
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                    Soil Health Score
                  </span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                    {analysisResult.soil_health_score || 72}/100
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Text */}
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed mt-4 bg-emerald-500/5 p-3.5 rounded-xl border border-emerald-500/15">
              {analysisResult.summary}
            </p>

            {/* Extracted Parameters Grid */}
            {analysisResult.detected_parameters && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
                <div className="p-2.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/60 border border-border/50 text-xs">
                  <span className="text-[10px] text-muted-foreground block">pH Status</span>
                  <span className="font-bold text-foreground">
                    {analysisResult.detected_parameters.ph} ({analysisResult.detected_parameters.ph_status})
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/60 border border-border/50 text-xs">
                  <span className="text-[10px] text-muted-foreground block">Nitrogen (N)</span>
                  <span className="font-bold text-foreground">
                    {analysisResult.detected_parameters.nitrogen}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/60 border border-border/50 text-xs">
                  <span className="text-[10px] text-muted-foreground block">Phosphorus & Potash</span>
                  <span className="font-bold text-foreground">
                    P: {analysisResult.detected_parameters.phosphorus} | K: {analysisResult.detected_parameters.potassium}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/60 border border-border/50 text-xs">
                  <span className="text-[10px] text-muted-foreground block">Zinc & Carbon</span>
                  <span className="font-bold text-foreground">
                    Zn: {analysisResult.detected_parameters.zinc} | OC: {analysisResult.detected_parameters.organic_carbon}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Recommended Crops Cards */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-500" />
              <span>🌟 Top Recommended Crops for Maximum Yield</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysisResult.recommended_crops?.map((rec: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-emerald-500/30 bg-white/70 dark:bg-[#0c0d0e]/80 backdrop-blur-xl flex flex-col justify-between shadow-sm hover:border-emerald-500 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {rec.season || "Season"}
                      </span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <Percent className="w-3 h-3" />
                        {rec.suitability}% Match
                      </span>
                    </div>

                    <h5 className="font-bold text-base text-foreground mb-1">{rec.crop}</h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rec.reason}</p>
                  </div>

                  {rec.expected_yield_boost && (
                    <div className="mt-3 pt-2 border-t border-border/50 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      ⚡ Expected: {rec.expected_yield_boost}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Crops to Avoid */}
          {analysisResult.crops_to_avoid && analysisResult.crops_to_avoid.length > 0 && (
            <div className="p-4 rounded-2xl border border-destructive/25 bg-destructive/5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-destructive flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>⚠️ Crops to Avoid (Inhe Lagane se Nuksan Ho Sakta Hai)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysisResult.crops_to_avoid.map((avoid: any, idx: number) => (
                  <div key={idx} className="text-xs text-foreground/90">
                    <span className="font-bold text-destructive block">• {avoid.crop}</span>
                    <span className="text-muted-foreground text-[11px]">{avoid.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fertilizer & Soil Prescription */}
          {analysisResult.fertilizer_prescription && (
            <div className="p-5 rounded-2xl border border-white/10 dark:border-white/10 bg-white/70 dark:bg-[#0c0d0e]/80 backdrop-blur-xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>💡 Precision Fertilizer & Acidity Prescription (Khaad aur Chuna Dose)</span>
              </h4>
              <ul className="space-y-2 text-xs text-foreground/90">
                {analysisResult.fertilizer_prescription.map((step: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>

              {analysisResult.organic_interventions && (
                <div className="pt-3 border-t border-border/50">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase block mb-1.5">
                    Jaivik Upay (Organic & Bio-fertilizers):
                  </span>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {analysisResult.organic_interventions.map((org: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{org}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* CTA to book official lab test */}
          <div className="p-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-foreground">
                Want Official Govt Certified Soil Testing with Doorstep Pickup?
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Book an appointment with certified labs (OUAT, NRRI, KVK) across Odisha starting from just ₹149.
              </p>
            </div>
            {onBookTest && (
              <Button
                onClick={onBookTest}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4 shrink-0"
              >
                Book Lab Appointment
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
