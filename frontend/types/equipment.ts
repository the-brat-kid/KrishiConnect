export type EquipmentCategory =
  | "all"
  | "tractors"
  | "harvesters"
  | "tillage"
  | "sowing"
  | "sprayers"
  | "irrigation";

export type PricingUnit = "hour" | "acre" | "day";

export interface EquipmentItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: "tractors" | "harvesters" | "tillage" | "sowing" | "sprayers" | "irrigation";
  powerHp?: string;
  specs: string;
  capacity?: string;
  pricePerHour?: number;
  pricePerAcre?: number;
  pricePerDay?: number;
  primaryPricing: PricingUnit;
  location: string;
  district: string;
  state: string;
  operatorIncluded: boolean;
  fuelPolicy: "renter" | "operator" | "included";
  verified: boolean;
  rating: number;
  totalBookings: number;
  isAvailable: boolean;
  contactPhone: string;
}

export interface EquipmentBookingPayload {
  equipmentId: string;
  equipmentName: string;
  farmerName: string;
  farmerPhone: string;
  village: string;
  district: string;
  pricingUnit: PricingUnit;
  durationUnits: number;
  bookingDate: string;
  needsOperator: boolean;
  notes?: string;
  totalAmount: number;
}
