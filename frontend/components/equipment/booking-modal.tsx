"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  Phone,
  MapPin,
  ShieldCheck,
  Fuel,
  UserCheck,
  ChevronRight,
  Info,
} from "lucide-react";
import { EquipmentItem, PricingUnit, EquipmentBookingPayload } from "@/types/equipment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface BookingModalProps {
  equipment: EquipmentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (booking: EquipmentBookingPayload) => void;
}

export function EquipmentBookingModal({
  equipment,
  isOpen,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const [pricingUnit, setPricingUnit] = useState<PricingUnit>("hour");
  const [durationUnits, setDurationUnits] = useState<number>(4);
  const [farmerName, setFarmerName] = useState("");
  const [farmerPhone, setFarmerPhone] = useState("");
  const [village, setVillage] = useState("");
  const [bookingDate, setBookingDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [needsOperator, setNeedsOperator] = useState(true);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    id: string;
    total: number;
  } | null>(null);

  if (!equipment) return null;

  // Sync pricing unit with equipment's primary unit if not set
  const activeRate =
    pricingUnit === "hour"
      ? equipment.pricePerHour || 800
      : pricingUnit === "acre"
      ? equipment.pricePerAcre || 1400
      : equipment.pricePerDay || 3200;

  const totalAmount = Math.round(activeRate * (durationUnits || 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate booking reservation
      await new Promise((r) => setTimeout(r, 900));

      const bookingPayload: EquipmentBookingPayload = {
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        farmerName,
        farmerPhone,
        village,
        district: equipment.district,
        pricingUnit,
        durationUnits,
        bookingDate,
        needsOperator: equipment.operatorIncluded || needsOperator,
        notes,
        totalAmount,
      };

      const bookingId = `KC-EQ-${Date.now().toString().slice(-6)}`;
      setConfirmedBooking({ id: bookingId, total: totalAmount });
      onSuccess(bookingPayload);
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmedBooking(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-[#0D0D0E]/95 dark:bg-[#0D0D0E]/95 backdrop-blur-2xl border border-white/10 text-foreground p-0 overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                  {equipment.brand}
                </span>
                {equipment.verified && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-emerald-500/40 text-emerald-400 bg-emerald-500/10 gap-1 font-medium">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white">{equipment.name}</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                {equipment.location}, {equipment.district}
              </p>
            </div>
          </div>
        </div>

        {confirmedBooking ? (
          // Success State
          <div className="p-6 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Rental Reserved</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Booking reference <span className="font-mono text-emerald-400 font-semibold">{confirmedBooking.id}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Equipment</span>
                <span className="text-white font-medium">{equipment.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scheduled Date</span>
                <span className="text-white font-medium">{bookingDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="text-white font-medium">
                  {durationUnits} {pricingUnit === "hour" ? "Hours" : pricingUnit === "acre" ? "Acres" : "Days"}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="text-muted-foreground font-semibold">Estimated Total</span>
                <span className="text-emerald-400 font-bold font-mono text-sm">
                  ₹{confirmedBooking.total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Hub coordinator will contact {farmerPhone || "your phone"} within 2 hours to confirm dispatch and route coordinates.
            </p>

            <Button
              onClick={handleClose}
              className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg"
            >
              Done
            </Button>
          </div>
        ) : (
          // Booking Form
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Equipment Quick Specs */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10">
                <span className="text-[10px] text-muted-foreground block">Power / Capacity</span>
                <span className="text-white font-medium">{equipment.powerHp || equipment.capacity || "Standard"}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10">
                <span className="text-[10px] text-muted-foreground block">Operator Support</span>
                <span className="text-white font-medium">
                  {equipment.operatorIncluded ? "Operator Included" : "Machine Only"}
                </span>
              </div>
            </div>

            {/* Pricing Model Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Rental Rate Model</Label>
              <div className="grid grid-cols-3 gap-2">
                {equipment.pricePerHour && (
                  <button
                    type="button"
                    onClick={() => setPricingUnit("hour")}
                    className={`p-2 rounded-lg border text-xs text-center transition-all ${
                      pricingUnit === "hour"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold"
                        : "border-white/10 bg-white/[0.02] text-muted-foreground hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="text-[10px]">Hourly</div>
                    <div className="font-mono font-bold mt-0.5">₹{equipment.pricePerHour}/hr</div>
                  </button>
                )}
                {equipment.pricePerAcre && (
                  <button
                    type="button"
                    onClick={() => setPricingUnit("acre")}
                    className={`p-2 rounded-lg border text-xs text-center transition-all ${
                      pricingUnit === "acre"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold"
                        : "border-white/10 bg-white/[0.02] text-muted-foreground hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="text-[10px]">Per Acre</div>
                    <div className="font-mono font-bold mt-0.5">₹{equipment.pricePerAcre}/ac</div>
                  </button>
                )}
                {equipment.pricePerDay && (
                  <button
                    type="button"
                    onClick={() => setPricingUnit("day")}
                    className={`p-2 rounded-lg border text-xs text-center transition-all ${
                      pricingUnit === "day"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold"
                        : "border-white/10 bg-white/[0.02] text-muted-foreground hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="text-[10px]">Daily</div>
                    <div className="font-mono font-bold mt-0.5">₹{equipment.pricePerDay}/day</div>
                  </button>
                )}
              </div>
            </div>

            {/* Duration / Quantity & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  {pricingUnit === "hour" ? "Hours Needed" : pricingUnit === "acre" ? "Land Area (Acres)" : "Days Needed"}
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={pricingUnit === "hour" ? 48 : pricingUnit === "acre" ? 200 : 30}
                  value={durationUnits}
                  onChange={(e) => setDurationUnits(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                  className="bg-white/[0.03] border-white/10 text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Required Date</Label>
                <Input
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                  className="bg-white/[0.03] border-white/10 text-xs h-9"
                />
              </div>
            </div>

            {/* Farmer Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Farmer Name</Label>
                <Input
                  type="text"
                  placeholder="e.g. Ramesh Pradhan"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  required
                  className="bg-white/[0.03] border-white/10 text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Phone Number</Label>
                <Input
                  type="tel"
                  placeholder="10-digit mobile"
                  value={farmerPhone}
                  onChange={(e) => setFarmerPhone(e.target.value)}
                  required
                  pattern="[0-9]{10}"
                  className="bg-white/[0.03] border-white/10 text-xs h-9"
                />
              </div>
            </div>

            {/* Village / Delivery Address */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Village / Farm Location</Label>
              <Input
                type="text"
                placeholder="Village, Block or Landmark"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                required
                className="bg-white/[0.03] border-white/10 text-xs h-9"
              />
            </div>

            {/* Price Summary Breakdown */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Calculated Cost</span>
                <span className="text-[11px] text-muted-foreground">
                  ₹{activeRate} × {durationUnits} {pricingUnit === "hour" ? "hrs" : pricingUnit === "acre" ? "acres" : "days"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-bold font-mono text-emerald-400">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
                <span className="block text-[10px] text-muted-foreground">Standard GST inclusive</span>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-10 border-white/10 bg-transparent hover:bg-white/[0.05] text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg"
              >
                {isSubmitting ? "Reserving..." : "Confirm Booking"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
