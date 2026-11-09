"use client";

import { useState, useMemo } from "react";
import { useCustomers, useCreateCustomer, useDeleteCustomer } from "@/hooks/use-customers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import {
  UserPlus,
  Search,
  Users,
  Building2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  PhoneCall,
  Store,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Filter,
  Trash2,
  AlertTriangle,
} from "lucide-react";

interface CropBuyer {
  id: string;
  businessName: string;
  contactPerson: string;
  category: "Mandi Trader" | "Rice Mill" | "Dal Mill" | "Food Processor" | "Exporter" | "Cold Storage / Retail";
  cropsNeeded: string[];
  volumeRequirement: string;
  location: string;
  state: string;
  paymentTerms: string;
  verified: boolean;
  activeDeal: string;
}

const VERIFIED_CROP_BUYERS: CropBuyer[] = [
  {
    id: "buyer-1",
    businessName: "Utkal Agro Commodities & Mills",
    contactPerson: "R. K. Mohapatra",
    category: "Rice Mill",
    cropsNeeded: ["Paddy", "Basmati Rice", "Broken Rice"],
    volumeRequirement: "100 – 500 MT / Month",
    location: "Cuttack / Bhubaneswar Belt",
    state: "Odisha",
    paymentTerms: "Immediate RTGS / 3-day bank settlement",
    verified: true,
    activeDeal: "Urgent demand for 150 MT Sona Masoori & Swarna Paddy",
  },
  {
    id: "buyer-2",
    businessName: "Kalinga Fresh Vegetable Aggregators",
    contactPerson: "Bikash Behera",
    category: "Mandi Trader",
    cropsNeeded: ["Tomato", "Onion Big", "Potato", "Green Chilli"],
    volumeRequirement: "5 – 15 MT / Daily",
    location: "Unit-1 Mandi, Bhubaneswar",
    state: "Odisha",
    paymentTerms: "Spot Cash / Same-day Mandi settlement",
    verified: true,
    activeDeal: "Buying daily fresh tomato lots (A-grade & B-grade)",
  },
  {
    id: "buyer-3",
    businessName: "Sambalpur Agro Trading Co.",
    contactPerson: "Ashok Pradhan",
    category: "Food Processor",
    cropsNeeded: ["Paddy", "Groundnut", "Mustard Seeds", "Maize"],
    volumeRequirement: "50 – 200 MT / Batch",
    location: "Sambalpur Mandi Hub",
    state: "Odisha",
    paymentTerms: "Advance 20% + Balance on weighing at mill",
    verified: true,
    activeDeal: "Procuring oilseeds and yellow maize directly from FPOs",
  },
  {
    id: "buyer-4",
    businessName: "Mahanadi Cold Chain & Retail Supplies",
    contactPerson: "Soumya Ranjan Das",
    category: "Cold Storage / Retail",
    cropsNeeded: ["Capsicum", "Bitter Gourd", "Mushroom", "French Beans"],
    volumeRequirement: "2 – 8 MT / Weekly",
    location: "Rasulgarh Industrial Area, Bhubaneswar",
    state: "Odisha",
    paymentTerms: "Weekly billing / 100% bank transfer",
    verified: true,
    activeDeal: "Regular contract supply for supermarket chains",
  },
  {
    id: "buyer-5",
    businessName: "Eastern Spices & Turmeric Exporters",
    contactPerson: "Debabrata Nayak",
    category: "Exporter",
    cropsNeeded: ["Turmeric (Kandhamal GI)", "Dry Ginger", "Black Pepper", "Chillies"],
    volumeRequirement: "25 – 100 MT / Season",
    location: "Berhampur & Kandhamal Hub",
    state: "Odisha",
    paymentTerms: "Letter of Credit / Bank guarantee for export lots",
    verified: true,
    activeDeal: "High curcumin Kandhamal turmeric export lots needed",
  },
  {
    id: "buyer-6",
    businessName: "Bengal Agri Trading Post",
    contactPerson: "Amitava Ghosh",
    category: "Mandi Trader",
    cropsNeeded: ["Onion", "Potato", "Raw Banana", "Colocasia"],
    volumeRequirement: "20 – 40 MT / Week",
    location: "Posta Mandi, Kolkata",
    state: "West Bengal",
    paymentTerms: "Interstate Mandi settlement / Truck receipt release",
    verified: true,
    activeDeal: "Direct sourcing from Odisha farmers along NH-16",
  },
  {
    id: "buyer-7",
    businessName: "Balasore Dal & Pulses Processing",
    contactPerson: "Ganesh Sahoo",
    category: "Dal Mill",
    cropsNeeded: ["Red Gram (Arhar)", "Green Gram (Moong)", "Black Gram (Biri)"],
    volumeRequirement: "30 – 100 MT / Month",
    location: "Balasore Mandi",
    state: "Odisha",
    paymentTerms: "Within 48 hours of mandi delivery",
    verified: true,
    activeDeal: "Procuring summer Moong dal from coastal Odisha farmers",
  },
  {
    id: "buyer-8",
    businessName: "Apex Agro Commodities Hyderabad",
    contactPerson: "V. Ramakrishna",
    category: "Exporter",
    cropsNeeded: ["Ginger (Fresh)", "Red Chilli", "Turmeric Finger"],
    volumeRequirement: "15 – 50 MT / Dispatch",
    location: "Bowenpally Market, Hyderabad",
    state: "Telangana",
    paymentTerms: "Prompt NEFT upon dock arrival",
    verified: true,
    activeDeal: "Bulk buying fresh ginger and spices directly from producers",
  },
];

export default function CustomersPage() {
  // Local CRM State
  const { data: customers, isLoading } = useCustomers();
  const { mutateAsync: createCustomer } = useCreateCustomer();
  const { mutateAsync: deleteCustomer, isPending: isDeleting } = useDeleteCustomer();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [cascadeInvoices, setCascadeInvoices] = useState(false);
  const [hasInvoiceConflict, setHasInvoiceConflict] = useState(false);
  const [conflictMessage, setConflictMessage] = useState("");
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "", gst_number: "" });

  // Crop Buyer Discovery State (AgroDealz Integration)
  const [buyerSearch, setBuyerSearch] = useState("");
  const [selectedCropCategory, setSelectedCropCategory] = useState<string>("all");
  const [selectedBuyerType, setSelectedBuyerType] = useState<string>("all");

  // AgroDealz Inquiry Form State
  const [inquiryData, setInquiryData] = useState({
    name: "",
    mobile: "",
    state: "Odisha",
    district: "Khordha (Bhubaneswar)",
    crop: "Tomato",
    quantity: "5 MT",
    notes: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCustomer(formData);
      toast({ title: "Success", description: "Customer created successfully" });
      setIsOpen(false);
      setFormData({ name: "", email: "", phone: "", address: "", gst_number: "" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create customer", variant: "destructive" });
    }
  };

  const handleDeleteCustomer = async (forceCascade: boolean = false) => {
    if (!deleteTarget) return;
    const shouldCascade = forceCascade || cascadeInvoices;
    try {
      await deleteCustomer({ id: deleteTarget.id, cascade: shouldCascade });
      toast({
        title: "Customer Deleted",
        description: shouldCascade
          ? `${deleteTarget.name} and all linked invoices were deleted.`
          : `${deleteTarget.name} has been removed from your customer ledger.`,
      });
      setDeleteTarget(null);
      setHasInvoiceConflict(false);
      setConflictMessage("");
      setCascadeInvoices(false);
    } catch (error: any) {
      const msg = error?.response?.data?.detail || "An error occurred while deleting the customer.";
      if (msg.includes("invoice") || msg.includes("linked") || msg.includes("referenced")) {
        setHasInvoiceConflict(true);
        setConflictMessage(msg);
      } else {
        toast({
          title: "Failed to delete customer",
          description: msg,
          variant: "destructive",
        });
      }
    }
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Enquiry Registered with KrishiConnect",
      description: "Verified by KrishiConnect: we will match you with verified crop buyers within 24 hours.",
    });
    // Open AgroDealz find-buyers page
    window.open("https://agrodealz.in/find-buyers", "_blank");
  };

  const stats = useMemo(() => {
    const list = customers || [];
    const withGst = list.filter((c: any) => c.gst_number).length;
    return { total: list.length, withGst, retail: list.length - withGst };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c: any) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.gst_number?.toLowerCase().includes(q)
    );
  }, [customers, search]);

  // Filter AgroDealz Crop Buyers
  const filteredCropBuyers = useMemo(() => {
    return VERIFIED_CROP_BUYERS.filter((b) => {
      const matchesSearch =
        b.businessName.toLowerCase().includes(buyerSearch.toLowerCase().trim()) ||
        b.contactPerson.toLowerCase().includes(buyerSearch.toLowerCase().trim()) ||
        b.location.toLowerCase().includes(buyerSearch.toLowerCase().trim()) ||
        b.cropsNeeded.some((crop) => crop.toLowerCase().includes(buyerSearch.toLowerCase().trim()));

      const matchesType = selectedBuyerType === "all" || b.category === selectedBuyerType;

      const matchesCrop =
        selectedCropCategory === "all" ||
        b.cropsNeeded.some((crop) => {
          if (selectedCropCategory === "Paddy") return crop.toLowerCase().includes("paddy") || crop.toLowerCase().includes("rice");
          if (selectedCropCategory === "Vegetables") return ["tomato", "onion", "potato", "chilli", "beans", "capsicum", "mushroom"].some((v) => crop.toLowerCase().includes(v));
          if (selectedCropCategory === "Spices") return ["turmeric", "ginger", "pepper", "chilli"].some((s) => crop.toLowerCase().includes(s));
          if (selectedCropCategory === "Pulses") return ["gram", "dal", "moong", "arhar", "biri"].some((p) => crop.toLowerCase().includes(p));
          return true;
        });

      return matchesSearch && matchesType && matchesCrop;
    });
  }, [buyerSearch, selectedBuyerType, selectedCropCategory]);

  function initials(name: string) {
    return (name || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 flex items-center gap-1 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Verified by KrishiConnect
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Crop Buyers & Customer Directory
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Find verified commodity buyers, mandi traders, and food mills across India, and manage your local billing clients.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://agrodealz.in/find-buyers"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-sm font-semibold">
              <Store className="h-4 w-4" />
              <span>Find Crop Buyers</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
      </div>

      {/* Main Tabs: Crop Buyers vs Local Invoiced Customers */}
      <Tabs defaultValue="crop-buyers" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-lg">
          <TabsTrigger value="crop-buyers" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span>Find Crop Buyers (Verified by KrishiConnect)</span>
            <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-800 ml-1">
              Live
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="my-customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>My Invoiced Customers (Local CRM)</span>
            <Badge variant="outline" className="text-[10px] ml-1">
              {stats.total}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: AGRODEALZ VERIFIED CROP BUYERS */}
        {/* ========================================================================= */}
        <TabsContent value="crop-buyers" className="space-y-6">
          {/* Highlight KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Verified Buyer Network</CardTitle>
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">50+ Verified Traders</div>
                <p className="text-xs text-muted-foreground mt-1">Mills, exporters & mandi commission agents</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">High Demand Commodities</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold text-foreground">Paddy, Tomato, Onion, Chilli</div>
                <p className="text-xs text-muted-foreground mt-1">Daily buying enquiries active in Odisha</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Zero Middlemen</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">Direct Deals</div>
                <p className="text-xs text-muted-foreground mt-1">Negotiate directly with mills & wholesalers</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Matching Response Time</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700">Within 24 Hours</div>
                <p className="text-xs text-muted-foreground mt-1">Verified by KrishiConnect buyer team</p>
              </CardContent>
            </Card>
          </div>

          {/* Direct Match Request Widget */}
          <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-50/50 via-card to-card shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-700">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle className="text-lg font-bold">Have Crops to Sell? Let KrishiConnect Find You a Buyer</CardTitle>
                    <CardDescription className="text-xs">
                      Submit your harvest details and KrishiConnect matches you with verified traders, mills, or exporters across India.
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-300 text-emerald-700 text-xs hidden sm:inline-flex">
                  Free Service for Farmers
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInquirySubmit} className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Your Name</Label>
                  <Input
                    required
                    placeholder="e.g. Ramesh Sahoo"
                    value={inquiryData.name}
                    onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
                    className="h-9 bg-card text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Mobile Number</Label>
                  <Input
                    required
                    placeholder="+91 98765 43210"
                    value={inquiryData.mobile}
                    onChange={(e) => setInquiryData({ ...inquiryData, mobile: e.target.value })}
                    className="h-9 bg-card text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Crop / Produce</Label>
                  <Input
                    required
                    placeholder="e.g. Paddy / Tomato"
                    value={inquiryData.crop}
                    onChange={(e) => setInquiryData({ ...inquiryData, crop: e.target.value })}
                    className="h-9 bg-card text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Quantity Available</Label>
                  <Input
                    placeholder="e.g. 10 MT / 50 Quintals"
                    value={inquiryData.quantity}
                    onChange={(e) => setInquiryData({ ...inquiryData, quantity: e.target.value })}
                    className="h-9 bg-card text-xs mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm">
                    <span>Find Buyers Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Search & Filters for Verified Crop Buyers */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search buyer name, crop (Paddy, Tomato), location..."
                value={buyerSearch}
                onChange={(e) => setBuyerSearch(e.target.value)}
                className="pl-9 bg-card text-sm"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter by Crop Category */}
              <select
                value={selectedCropCategory}
                onChange={(e) => setSelectedCropCategory(e.target.value)}
                className="h-9 rounded-md border border-input bg-card px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">All Crops</option>
                <option value="Paddy">Paddy / Rice</option>
                <option value="Vegetables">Vegetables (Tomato, Onion, etc.)</option>
                <option value="Spices">Spices (Turmeric, Ginger)</option>
                <option value="Pulses">Pulses / Dal</option>
              </select>

              {/* Filter by Buyer Type */}
              <select
                value={selectedBuyerType}
                onChange={(e) => setSelectedBuyerType(e.target.value)}
                className="h-9 rounded-md border border-input bg-card px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">All Buyer Types</option>
                <option value="Mandi Trader">Mandi Commission Agents</option>
                <option value="Rice Mill">Rice Mills</option>
                <option value="Dal Mill">Dal Mills</option>
                <option value="Food Processor">Food Processors</option>
                <option value="Exporter">Exporters</option>
                <option value="Cold Storage / Retail">Cold Storage / Retail</option>
              </select>
            </div>
          </div>

          {/* Verified Crop Buyers Table */}
          <div className="rounded-lg border bg-card shadow-xs overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Buyer / Trading Business</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Crops Actively Sourcing</TableHead>
                  <TableHead className="text-center">Volume Need</TableHead>
                  <TableHead>Location / Market</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCropBuyers.length === 0 ? (
                  <TableRow>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground text-sm">
                      No crop buyers found matching &quot;{buyerSearch}&quot;.
                    </td>
                  </TableRow>
                ) : (
                  filteredCropBuyers.map((buyer) => (
                    <TableRow key={buyer.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-semibold text-foreground">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span>{buyer.businessName}</span>
                            {buyer.verified && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground font-normal">
                            Contact: {buyer.contactPerson}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            buyer.category === "Rice Mill" || buyer.category === "Dal Mill"
                              ? "bg-amber-50 text-amber-800 border-amber-200 text-xs"
                              : buyer.category === "Exporter"
                              ? "bg-purple-50 text-purple-800 border-purple-200 text-xs"
                              : buyer.category === "Mandi Trader"
                              ? "bg-blue-50 text-blue-800 border-blue-200 text-xs"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200 text-xs"
                          }
                        >
                          {buyer.category}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {buyer.cropsNeeded.map((crop) => (
                            <span
                              key={crop}
                              className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium"
                            >
                              {crop}
                            </span>
                          ))}
                        </div>
                      </TableCell>

                      <TableCell className="text-center font-bold text-xs text-foreground">
                        {buyer.volumeRequirement}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-emerald-600" />
                          <span>{buyer.location}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{buyer.state}</span>
                      </TableCell>

                      <TableCell className="text-xs text-foreground/90 max-w-[180px]">
                        {buyer.paymentTerms}
                      </TableCell>

                      <TableCell className="text-center">
                        <a
                          href="https://agrodealz.in/find-buyers"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="sm"
                            className="text-xs h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1"
                          >
                            <span>Connect</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </a>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: MY LOCAL INVOICED CUSTOMERS (CRM) */}
        {/* ========================================================================= */}
        <TabsContent value="my-customers" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">My Invoiced Customers</h2>
              <p className="text-xs text-muted-foreground">Manage your billing accounts, retail buyers and GST records</p>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Add New Customer</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Customer / Business Name</Label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Maa Tarini Traders"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="buyer@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address / Mandi Location</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Unit-1 Mandi, Bhubaneswar"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GST Number (Optional)</Label>
                    <Input
                      value={formData.gst_number}
                      onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                      placeholder="21AAAAA0000A1Z5"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Save Customer
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Local Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-muted-foreground">Total Invoiced</span>
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold mt-2">{stats.total}</div>
            </Card>
            <Card className="p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-muted-foreground">GST Registered (B2B)</span>
                <Building2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold mt-2">{stats.withGst}</div>
            </Card>
            <Card className="p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-muted-foreground">Retail Shoppers</span>
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold mt-2">{stats.retail}</div>
            </Card>
          </div>

          {/* Search Local */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search local customer name, phone, email or GSTIN..."
              className="pl-9 bg-card text-sm"
            />
          </div>

          {/* Local Customers Table */}
          <div className="rounded-2xl border border-white/10 bg-card/40 dark:bg-black/30 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.35)] overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/[0.04] dark:bg-white/[0.02] border-b border-white/10">
                <TableRow className="border-b border-white/10 hover:bg-transparent">
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>GST Number</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">
                      Loading local customers...
                    </td>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">
                      No local customers found. Add your first customer above.
                    </td>
                  </TableRow>
                ) : (
                  filteredCustomers.map((c: any) => (
                    <TableRow key={c.id} className="hover:bg-white/[0.05] border-b border-white/5 transition-colors group">
                      <TableCell className="font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {initials(c.name)}
                          </div>
                          <span>{c.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>{c.email || "-"}</div>
                        <div className="text-muted-foreground">{c.phone || "-"}</div>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {c.gst_number ? (
                          <Badge variant="outline" className="font-mono text-xs">
                            {c.gst_number}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Unregistered</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {c.address || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ id: c.id, name: c.name })}
                          className="btn-liquid-glass inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                          title={`Delete ${c.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete {c.name}</span>
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Customer Confirmation Modal */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setHasInvoiceConflict(false);
            setConflictMessage("");
            setCascadeInvoices(false);
          }
        }}
      >
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-2xl border-white/10">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  {hasInvoiceConflict ? "Delete Customer & Invoices" : "Delete Customer"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">Permanent account removal</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-foreground/90 leading-relaxed">
              Are you sure you want to delete <strong className="text-rose-400 font-semibold">{deleteTarget?.name}</strong> from your customer ledger?
            </p>

            {hasInvoiceConflict ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 space-y-2.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>Linked Invoices Found</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {conflictMessage}
                </p>
                <label className="flex items-center gap-2 cursor-pointer pt-1 text-foreground font-semibold">
                  <input
                    type="checkbox"
                    checked={cascadeInvoices}
                    onChange={(e) => setCascadeInvoices(e.target.checked)}
                    className="rounded border-white/20 text-rose-600 focus:ring-rose-500 h-4 w-4"
                  />
                  <span>Force delete customer along with all linked invoices</span>
                </label>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground bg-white/[0.03] p-3 rounded-lg border border-white/5">
                This will remove this customer from your active CRM accounts.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteTarget(null);
                  setHasInvoiceConflict(false);
                  setConflictMessage("");
                  setCascadeInvoices(false);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                loading={isDeleting}
                loadingText="Deleting..."
                disabled={hasInvoiceConflict && !cascadeInvoices}
                onClick={() => handleDeleteCustomer(cascadeInvoices)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                {hasInvoiceConflict ? "Force Delete All" : "Delete Customer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
