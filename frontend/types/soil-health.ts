export interface SoilHealthLab {
  id: string;
  name: string;
  district: string;
  location: string;
  state: string;
  pincode?: string;
  contact_phone: string;
  accreditation: string;
  turnaround_days: number;
  rating: number;
  total_tests_conducted: number;
  doorstep_collection: boolean;
  base_fee: number;
  supported_tests: string[];
  is_active: boolean;
  created_at?: string;
}

export interface SoilHealthAppointment {
  id: string;
  lab_id: string;
  user_id?: string;
  farmer_name: string;
  farmer_phone: string;
  farm_district: string;
  village_or_area: string;
  farm_size_acres: number;
  crop_planned: string;
  soil_type: string;
  test_package: string;
  appointment_mode: "Doorstep Pickup" | "Direct Lab Drop-off" | string;
  appointment_date: string;
  time_slot: string;
  notes?: string;
  status: "confirmed" | "sample_collected" | "in_lab" | "report_ready" | "cancelled" | string;
  total_amount: number;
  created_at: string;
  lab?: SoilHealthLab;
}

export interface SoilAppointmentFormData {
  lab_id: string;
  farmer_name: string;
  farmer_phone: string;
  farm_district: string;
  village_or_area: string;
  farm_size_acres: number;
  crop_planned: string;
  soil_type: string;
  test_package: string;
  appointment_mode: string;
  appointment_date: string;
  time_slot: string;
  notes?: string;
  total_amount: number;
}
