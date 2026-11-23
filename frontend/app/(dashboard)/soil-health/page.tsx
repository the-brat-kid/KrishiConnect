"use client";

import React, { useState, useEffect } from "react";
import { SoilHealthLab, SoilHealthAppointment } from "@/types/soil-health";
import { SoilLabCard } from "@/components/soil-health/soil-lab-card";
import { SoilAppointmentModal } from "@/components/soil-health/soil-appointment-modal";
import { SoilSamplingGuide } from "@/components/soil-health/soil-sampling-guide";
import { SoilAiScanner } from "@/components/soil-health/soil-ai-scanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import {
  FlaskConical,
  Search,
  Filter,
  CalendarCheck,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  Trash2,
  RefreshCw,
  FileCheck,
  ShieldAlert,
} from "lucide-react";

const FALLBACK_LABS: SoilHealthLab[] = [
  {
    id: "lab-ouat-bbsr",
    name: "OUAT Central Soil & Fertilizer Testing Research Lab",
    district: "Khordha",
    location: "College of Agriculture, OUAT Campus, Siripur",
    state: "Odisha",
    pincode: "751003",
    contact_phone: "+91 674 239 7970",
    accreditation: "ICAR & NABL Accredited (ISO/IEC 17025)",
    turnaround_days: 2,
    rating: 4.9,
    total_tests_conducted: 3480,
    doorstep_collection: true,
    base_fee: 199.0,
    supported_tests: [
      "12-Parameter Complete Health Card",
      "Basic NPK + pH + Organic Carbon",
      "Micronutrient Panel (Zn, Fe, Cu, Mn, B)",
      "Salinity & Electrical Conductivity (EC)",
    ],
    is_active: true,
  },
  {
    id: "lab-nrri-cuttack",
    name: "ICAR-NRRI Soil Science & Plant Health Center",
    district: "Cuttack",
    location: "Bidyadharpur, Near NH-16",
    state: "Odisha",
    pincode: "753006",
    contact_phone: "+91 671 236 7777",
    accreditation: "Govt of India ICAR National Institute",
    turnaround_days: 3,
    rating: 4.95,
    total_tests_conducted: 4820,
    doorstep_collection: true,
    base_fee: 249.0,
    supported_tests: [
      "12-Parameter Complete Health Card",
      "Heavy Metal & Residue Screening",
      "Wetland & Lowland Rice Soil Profiling",
      "Microbial Biomass & Organic Carbon",
    ],
    is_active: true,
  },
  {
    id: "lab-kvk-sambalpur",
    name: "Sambalpur District Krishi Vigyan Kendra (KVK)",
    district: "Sambalpur",
    location: "Chiplima Agro Hub, Near Hirakud Dam",
    state: "Odisha",
    pincode: "768025",
    contact_phone: "+91 663 245 1280",
    accreditation: "Dept of Agriculture, Govt of Odisha",
    turnaround_days: 3,
    rating: 4.75,
    total_tests_conducted: 1940,
    doorstep_collection: true,
    base_fee: 149.0,
    supported_tests: [
      "12-Parameter Complete Health Card",
      "Basic NPK + Soil Texture",
      "Canal Command Salinity Diagnostic",
    ],
    is_active: true,
  },
  {
    id: "lab-bargarh-hub",
    name: "Bargarh Rice Bowl Precision Soil Clinic",
    district: "Bargarh",
    location: "APMC Mandi Yard, Attabira Road",
    state: "Odisha",
    pincode: "768028",
    contact_phone: "+91 6646 232 890",
    accreditation: "Krishi Vigyan Kendra Certified",
    turnaround_days: 2,
    rating: 4.85,
    total_tests_conducted: 3120,
    doorstep_collection: true,
    base_fee: 199.0,
    supported_tests: [
      "12-Parameter Complete Health Card",
      "Intensive Paddy NPK & Zinc Depletion",
      "Custom Bio-Fertilizer Prescription",
    ],
    is_active: true,
  },
  {
    id: "lab-ganjam-berhampur",
    name: "South Odisha Soil Fertility & Diagnostic Lab",
    district: "Ganjam",
    location: "Ankushpur Mandi Road, Berhampur",
    state: "Odisha",
    pincode: "760001",
    contact_phone: "+91 680 228 1450",
    accreditation: "Govt of Odisha Soil Testing Network",
    turnaround_days: 2,
    rating: 4.8,
    total_tests_conducted: 2210,
    doorstep_collection: true,
    base_fee: 199.0,
    supported_tests: [
      "12-Parameter Complete Health Card",
      "Red Laterite Acidity Correction (Lime Dose)",
      "Vegetable & Chilli Nutrient Profiling",
    ],
    is_active: true,
  },
  {
    id: "lab-kvk-balasore",
    name: "Northern Coastal Agro Diagnostics & Soil Lab",
    district: "Balasore",
    location: "KVK Remuna, Industrial Area",
    state: "Odisha",
    pincode: "756019",
    contact_phone: "+91 6782 254 310",
    accreditation: "State Soil Testing Laboratory Accredited",
    turnaround_days: 3,
    rating: 4.7,
    total_tests_conducted: 1580,
    doorstep_collection: true,
    base_fee: 180.0,
    supported_tests: [
      "12-Parameter Complete Health Card",
      "Coastal Saline Soil Test",
      "Paddy & Oilseed Recommendation",
    ],
    is_active: true,
  },
];

export default function SoilHealthPage() {
  const { toast } = useToast();
  const [labs, setLabs] = useState<SoilHealthLab[]>(FALLBACK_LABS);
  const [appointments, setAppointments] = useState<SoilHealthAppointment[]>([]);
  const [isLoadingLabs, setIsLoadingLabs] = useState(false);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [activeTab, setActiveTab] = useState("ai-scanner");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLabForBooking, setSelectedLabForBooking] = useState<SoilHealthLab | null>(null);

  // Fetch Labs
  const fetchLabs = async () => {
    try {
      setIsLoadingLabs(true);
      const { data } = await api.get("/soil-health/labs");
      if (Array.isArray(data) && data.length > 0) {
        setLabs(data);
      }
    } catch (err) {
      console.warn("Could not fetch remote labs, using fallback:", err);
    } finally {
      setIsLoadingLabs(false);
    }
  };

  // Fetch Appointments
  const fetchAppointments = async () => {
    try {
      setIsLoadingAppointments(true);
      const { data } = await api.get("/soil-health/appointments");
      if (Array.isArray(data)) {
        setAppointments(data);
      }
    } catch (err) {
      console.warn("Could not fetch appointments:", err);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    fetchLabs();
    fetchAppointments();
  }, []);

  const handleOpenBooking = (lab?: SoilHealthLab) => {
    setSelectedLabForBooking(lab || labs[0] || null);
    setIsModalOpen(true);
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await api.delete(`/soil-health/appointments/${id}`);
      toast({ title: "Appointment Cancelled" });
      fetchAppointments();
    } catch (err: any) {
      toast({
        title: "Cancel failed",
        description: err.response?.data?.detail || "Could not cancel appointment",
        variant: "destructive",
      });
    }
  };

  // Filtered labs
  const filteredLabs = labs.filter((lab) => {
    const matchesSearch =
      lab.name.toLowerCase().includes(search.toLowerCase()) ||
      lab.location.toLowerCase().includes(search.toLowerCase()) ||
      lab.district.toLowerCase().includes(search.toLowerCase());
    const matchesDistrict =
      selectedDistrict === "all" || lab.district.toLowerCase() === selectedDistrict.toLowerCase();
    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Govt & NABL Certified Testing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Soil Health Check & Field Diagnostic
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Book an appointment for comprehensive 12-parameter soil fertility testing. Doorstep field sample pickup available nationwide across key agricultural districts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={() => handleOpenBooking()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-10 px-4 shadow-sm flex items-center gap-2"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Book Soil Test</span>
          </Button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-white/10 dark:border-white/10 bg-white/60 dark:bg-[#0c0d0e]/60 backdrop-blur-md">
          <span className="text-[11px] font-semibold text-muted-foreground block">Testing Standard</span>
          <span className="text-sm font-bold text-foreground">12 Govt Parameters</span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5">NPK, pH, EC, 5 Micronutrients</span>
        </div>
        <div className="p-3.5 rounded-xl border border-white/10 dark:border-white/10 bg-white/60 dark:bg-[#0c0d0e]/60 backdrop-blur-md">
          <span className="text-[11px] font-semibold text-muted-foreground block">Fast Diagnostic</span>
          <span className="text-sm font-bold text-foreground">48 - 72 Hours</span>
          <span className="text-[11px] text-primary block mt-0.5">Digital Report on WhatsApp/SMS</span>
        </div>
        <div className="p-3.5 rounded-xl border border-white/10 dark:border-white/10 bg-white/60 dark:bg-[#0c0d0e]/60 backdrop-blur-md">
          <span className="text-[11px] font-semibold text-muted-foreground block">Sampling Mode</span>
          <span className="text-sm font-bold text-foreground">Doorstep Pickup</span>
          <span className="text-[11px] text-muted-foreground block mt-0.5">Krishi Mitra visits your field</span>
        </div>
        <div className="p-3.5 rounded-xl border border-white/10 dark:border-white/10 bg-white/60 dark:bg-[#0c0d0e]/60 backdrop-blur-md">
          <span className="text-[11px] font-semibold text-muted-foreground block">Subsidized Cost</span>
          <span className="text-sm font-bold text-foreground">From ₹149</span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5">Govt Scheme Affiliated</span>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-2">
          <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1">
            <TabsTrigger value="ai-scanner" className="text-xs font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>AI Crop Advisor</span>
            </TabsTrigger>
            <TabsTrigger value="labs" className="text-xs font-semibold">
              Certified Labs ({labs.length})
            </TabsTrigger>
            <TabsTrigger value="appointments" className="text-xs font-semibold relative">
              My Appointments
              {appointments.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                  {appointments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="guide" className="text-xs font-semibold">
              Sampling Manual
            </TabsTrigger>
          </TabsList>

          {activeTab === "labs" && (
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search lab or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>

              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="h-8 px-2.5 rounded-md border border-input bg-background text-xs focus:outline-none"
              >
                <option value="all">All Districts</option>
                <option value="Khordha">Khordha</option>
                <option value="Cuttack">Cuttack</option>
                <option value="Sambalpur">Sambalpur</option>
                <option value="Bargarh">Bargarh</option>
                <option value="Ganjam">Ganjam</option>
                <option value="Balasore">Balasore</option>
              </select>
            </div>
          )}
        </div>

        {/* TAB 0: AI CROP ADVISOR */}
        <TabsContent value="ai-scanner" className="pt-1">
          <SoilAiScanner onBookTest={() => handleOpenBooking()} />
        </TabsContent>

        {/* TAB 1: CERTIFIED LABS */}
        <TabsContent value="labs" className="space-y-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLabs.map((lab) => (
              <SoilLabCard key={lab.id} lab={lab} onBook={(l) => handleOpenBooking(l)} />
            ))}
          </div>

          {filteredLabs.length === 0 && (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border p-6">
              <FlaskConical className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
              <h4 className="font-bold text-foreground">No Labs Found</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Try changing your search terms or district filter.
              </p>
            </div>
          )}
        </TabsContent>

        {/* TAB 2: MY APPOINTMENTS */}
        <TabsContent value="appointments" className="space-y-4 pt-1">
          {appointments.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-border/80 bg-zinc-50/50 dark:bg-zinc-900/30 p-8">
              <CalendarCheck className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-bold text-base text-foreground mb-1">
                No Soil Test Appointments Yet
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5">
                Book a testing appointment to know your field&apos;s NPK, pH, and micronutrients before planting the next season.
              </p>
              <Button
                onClick={() => handleOpenBooking()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4"
              >
                + Book Your First Soil Check
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-5 rounded-2xl border border-white/10 dark:border-white/10 bg-white/70 dark:bg-[#0c0d0e]/80 backdrop-blur-xl space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                        Booking ID: #{apt.id.slice(0, 8)}
                      </span>
                      <h4 className="font-bold text-base text-foreground">{apt.farmer_name}</h4>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        {apt.crop_planned} • {apt.farm_size_acres} Acres • {apt.farm_district}
                      </span>
                    </div>

                    <Badge
                      variant="outline"
                      className="capitalize text-xs font-semibold border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    >
                      {apt.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-100/60 dark:bg-zinc-900/60 text-xs">
                    <div>
                      <span className="text-muted-foreground text-[10px] block">Test Package:</span>
                      <span className="font-medium text-foreground line-clamp-1">{apt.test_package}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[10px] block">Mode:</span>
                      <span className="font-medium text-foreground flex items-center gap-1">
                        {apt.appointment_mode === "Doorstep Pickup" ? (
                          <Truck className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Building2 className="w-3 h-3 text-primary" />
                        )}
                        {apt.appointment_mode}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[10px] block">Date:</span>
                      <span className="font-medium text-foreground">
                        {new Date(apt.appointment_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[10px] block">Time Slot:</span>
                      <span className="font-medium text-foreground">{apt.time_slot}</span>
                    </div>
                  </div>

                  {apt.village_or_area && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                      <span className="line-clamp-1">{apt.village_or_area}, {apt.farm_district}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Fee:</span>
                      <span className="text-sm font-black text-foreground">₹{apt.total_amount}</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelAppointment(apt.id)}
                      className="text-xs text-destructive hover:bg-destructive/10 h-8 px-2.5 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: SAMPLING MANUAL */}
        <TabsContent value="guide" className="pt-1">
          <SoilSamplingGuide />
        </TabsContent>
      </Tabs>

      {/* Booking Modal */}
      <SoilAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedLab={selectedLabForBooking}
        onAppointmentBooked={() => {
          fetchAppointments();
          setActiveTab("appointments");
        }}
      />
    </div>
  );
}
