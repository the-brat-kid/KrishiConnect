"use client"

import React, { useState } from "react"
import { Calendar, Package, AlertCircle, X } from "lucide-react"
import { ColdStorageFacility } from "@/types/cold-storage"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BookingModalProps {
  facility: ColdStorageFacility | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function BookingModal({ facility, isOpen, onClose, onSuccess }: BookingModalProps) {
  const [cropName, setCropName] = useState("")
  const [quantity, setQuantity] = useState<number>(50)
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [durationDays, setDurationDays] = useState<number>(30)
  const [farmerName, setFarmerName] = useState("")
  const [farmerPhone, setFarmerPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!facility) return null

  const estimatedCost = Math.round(quantity * (facility.daily_rate_per_quintal || 2.5) * durationDays)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate booking confirmation / API call
      await new Promise((r) => setTimeout(r, 1200))
      onSuccess()
      onClose()
    } catch (err) {
      console.error("Booking error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-2xl border-border/80">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Book Cold Storage Chamber</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {facility.name} • {facility.district}, Odisha
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Crop Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs">Select Crop</Label>
            <Select value={cropName} onValueChange={setCropName} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose stored produce" />
              </SelectTrigger>
              <SelectContent>
                {facility.suitable_crops.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <Label>Quantity (Quintals)</Label>
              <span className="text-muted-foreground font-mono">Max: {facility.available_capacity_quintals} Qtl</span>
            </div>
            <Input
              type="number"
              min={1}
              max={facility.available_capacity_quintals}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </div>

          {/* Dates & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Storage Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Duration (Days)</Label>
              <Input
                type="number"
                min={7}
                max={365}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Farmer Contact Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Farmer / Trader Name</Label>
              <Input
                placeholder="e.g. Ramesh Jena"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Mobile Number</Label>
              <Input
                placeholder="e.g. 9876543210"
                value={farmerPhone}
                onChange={(e) => setFarmerPhone(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Estimated Cost Summary */}
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted-foreground">Estimated Total Rent</span>
              <p className="text-lg font-bold text-primary font-mono">₹{estimatedCost.toLocaleString("en-IN")}</p>
            </div>
            <span className="text-xs text-muted-foreground">({durationDays} days @ ₹{facility.daily_rate_per_quintal}/qtl)</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={isSubmitting}
              loadingText="Confirming Space..."
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              Confirm Booking
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
