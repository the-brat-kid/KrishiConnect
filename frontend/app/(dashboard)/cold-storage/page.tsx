

"use client"

import React, { useState } from "react"
import { Warehouse, Search, Filter, ShieldCheck, ThermometerSnowflake, Plus } from "lucide-react"
import { ColdStorageFacility } from "@/types/cold-storage"
import { ColdStorageCard } from "@/components/cold-storage/cold-storage-card"
import { BookingModal } from "@/components/cold-storage/booking-modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const DEMO_FACILITIES: ColdStorageFacility[] = [
  {
    id: "cs-1",
    name: "Kalinga Agri-Tech Cold Storage",
    location: "Jagatpur Industrial Zone",
    district: "Cuttack",
    state: "Odisha",
    pincode: "754021",
    total_capacity_quintals: 5000,
    available_capacity_quintals: 1850,
    temp_min_celsius: 2.0,
    temp_max_celsius: 6.0,
    current_temp_celsius: 3.8,
    humidity_percentage: 88,
    daily_rate_per_quintal: 2.4,
    suitable_crops: ["Potato", "Onion", "Ginger", "Carrot"],
    contact_phone: "+91 94370 12345",
    has_backup_power: true,
    has_cctv: true,
    has_humidity_control: true,
    is_active: true,
  },
  {
    id: "cs-2",
    name: "Utkal Mega Cold Chain & Logistics",
    location: "NH-16, Khandagiri Bypass",
    district: "Khordha",
    state: "Odisha",
    pincode: "751030",
    total_capacity_quintals: 8000,
    available_capacity_quintals: 4200,
    temp_min_celsius: 0.0,
    temp_max_celsius: 4.0,
    current_temp_celsius: 2.1,
    humidity_percentage: 92,
    daily_rate_per_quintal: 3.1,
    suitable_crops: ["Tomato", "Apple", "Cauliflower", "Capsicum"],
    contact_phone: "+91 98610 56789",
    has_backup_power: true,
    has_cctv: true,
    has_humidity_control: true,
    is_active: true,
  },
  {
    id: "cs-3",
    name: "Hirakud Farmers Agro Vault",
    location: "Baraipali APMC Hub",
    district: "Sambalpur",
    state: "Odisha",
    pincode: "768006",
    total_capacity_quintals: 4500,
    available_capacity_quintals: 620,
    temp_min_celsius: 3.0,
    temp_max_celsius: 8.0,
    current_temp_celsius: 4.5,
    humidity_percentage: 82,
    daily_rate_per_quintal: 2.1,
    suitable_crops: ["Potato", "Onion", "Garlic"],
    contact_phone: "+91 99372 98765",
    has_backup_power: true,
    has_cctv: true,
    has_humidity_control: false,
    is_active: true,
  },
]

export default function ColdStoragePage() {
  const [facilities, setFacilities] = useState<ColdStorageFacility[]>(DEMO_FACILITIES)
  const [search, setSearch] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("all")
  const [bookingFacility, setBookingFacility] = useState<ColdStorageFacility | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredFacilities = facilities.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.location.toLowerCase().includes(search.toLowerCase()) ||
      f.suitable_crops.some((c) => c.toLowerCase().includes(search.toLowerCase()))
    const matchesDistrict = selectedDistrict === "all" || f.district.toLowerCase() === selectedDistrict.toLowerCase()
    return matchesSearch && matchesDistrict
  })

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <ThermometerSnowflake className="h-3.5 w-3.5" />
            <span>Preservation & Post-Harvest</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-editorial">
            Cold Storage Network
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Book temperature-controlled chambers, monitor humidity, and protect your harvest from mandi price drops.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            <Plus className="h-4 w-4" />
            <span>List New Facility</span>
          </Button>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card/60 border border-border/60 backdrop-blur-md">
          <span className="text-xs text-muted-foreground font-medium">Total Network Capacity</span>
          <p className="text-xl font-black text-foreground font-mono mt-1">17,500 Qtl</p>
        </div>
        <div className="p-4 rounded-xl bg-card/60 border border-border/60 backdrop-blur-md">
          <span className="text-xs text-muted-foreground font-medium">Available Space</span>
          <p className="text-xl font-black text-primary font-mono mt-1">6,670 Qtl</p>
        </div>
        <div className="p-4 rounded-xl bg-card/60 border border-border/60 backdrop-blur-md">
          <span className="text-xs text-muted-foreground font-medium">Average Daily Rent</span>
          <p className="text-xl font-black text-foreground font-mono mt-1">₹2.53 /qtl</p>
        </div>
        <div className="p-4 rounded-xl bg-card/60 border border-border/60 backdrop-blur-md">
          <span className="text-xs text-muted-foreground font-medium">Odisha Active Hubs</span>
          <p className="text-xl font-black text-emerald-500 font-mono mt-1">3 Districts</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by facility name, crop (e.g. Potato), or location..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant={selectedDistrict === "all" ? "default" : "outline"}
            onClick={() => setSelectedDistrict("all")}
          >
            All Odisha
          </Button>
          <Button
            size="sm"
            variant={selectedDistrict === "Cuttack" ? "default" : "outline"}
            onClick={() => setSelectedDistrict("Cuttack")}
          >
            Cuttack
          </Button>
          <Button
            size="sm"
            variant={selectedDistrict === "Khordha" ? "default" : "outline"}
            onClick={() => setSelectedDistrict("Khordha")}
          >
            Khordha
          </Button>
          <Button
            size="sm"
            variant={selectedDistrict === "Sambalpur" ? "default" : "outline"}
            onClick={() => setSelectedDistrict("Sambalpur")}
          >
            Sambalpur
          </Button>
        </div>
      </div>

      {/* Facility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities.map((fac) => (
          <ColdStorageCard
            key={fac.id}
            facility={fac}
            onBook={(f) => {
              setBookingFacility(f)
              setIsModalOpen(true)
            }}
          />
        ))}
      </div>

      {/* Booking Dialog */}
      <BookingModal
        facility={bookingFacility}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => alert("Booking confirmed successfully!")}
      />
    </div>
  )
}