
export interface ColdStorageFacility {
  id: string
  name: string
  location: string
  district: string
  state: string
  pincode?: string
  total_capacity_quintals: number
  available_capacity_quintals: number
  temp_min_celsius: number
  temp_max_celsius: number
  current_temp_celsius: number
  humidity_percentage: number
  daily_rate_per_quintal: number
  suitable_crops: string[]
  contact_phone: string
  contact_person?: string
  has_backup_power: boolean
  has_cctv: boolean
  has_humidity_control: boolean
  is_active: boolean
}

export interface ColdStorageBooking {
  id: string
  facility_id: string
  crop_name: string
  quantity_quintals: number
  start_date: string
  end_date: string
  total_days: number
  daily_rate: number
  estimated_total_cost: number
  farmer_name: string
  farmer_phone: string
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled"
  created_at: string
}