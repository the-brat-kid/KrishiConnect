import { NextResponse } from "next/server";

export interface FreightCalculationRequest {
  fromCity: string;
  toCity: string;
  distanceKm: number;
  commodity: string;
  weightMt: number;
  truckType: "tata-ace" | "canter-14" | "truck-19" | "taurus-multi" | "reefer-cold";
}

const TRUCK_SPECS = {
  "tata-ace": {
    name: "Tata Ace / Bolero Pickup",
    capacity: "1 - 2 MT",
    maxWeight: 2,
    baseFare: 1200,
    perKmRateMin: 26,
    perKmRateMax: 32,
    tollPer100Km: 150,
  },
  "canter-14": {
    name: "14ft - 17ft Canter / Eicher",
    capacity: "3 - 5 MT",
    maxWeight: 5,
    baseFare: 3500,
    perKmRateMin: 36,
    perKmRateMax: 44,
    tollPer100Km: 280,
  },
  "truck-19": {
    name: "19ft - 22ft 6-Wheeler",
    capacity: "7 - 10 MT",
    maxWeight: 10,
    baseFare: 7000,
    perKmRateMin: 48,
    perKmRateMax: 58,
    tollPer100Km: 450,
  },
  "taurus-multi": {
    name: "10/12-Wheeler Multi-Axle Taurus",
    capacity: "15 - 25 MT",
    maxWeight: 25,
    baseFare: 14000,
    perKmRateMin: 65,
    perKmRateMax: 85,
    tollPer100Km: 750,
  },
  "reefer-cold": {
    name: "Cold Storage Reefer (Refrigerated)",
    capacity: "3 - 10 MT",
    maxWeight: 10,
    baseFare: 8000,
    perKmRateMin: 58,
    perKmRateMax: 76,
    tollPer100Km: 450,
  },
};

export async function POST(request: Request) {
  try {
    const body: FreightCalculationRequest = await request.json();
    const { fromCity, toCity, distanceKm, commodity, weightMt, truckType } = body;

    const truck = TRUCK_SPECS[truckType] || TRUCK_SPECS["canter-14"];

    // Base km calculation
    const distance = Math.max(distanceKm || 10, 10);
    const weight = Math.max(weightMt || 1, 0.5);

    // Mileage fee
    const rawMin = Math.max(truck.baseFare, distance * truck.perKmRateMin);
    const rawMax = Math.max(truck.baseFare * 1.15, distance * truck.perKmRateMax);

    // Commodity factor (Perishables / Cold chain adds handling margin)
    let commodityFactor = 1.0;
    if (commodity.includes("Perishable") || commodity.includes("Cold-Chain")) {
      commodityFactor = 1.15;
    } else if (commodity.includes("Fertilizer") || commodity.includes("Seeds")) {
      commodityFactor = 1.05;
    }

    // Tolls & FASTag
    const estTolls = Math.round((distance / 100) * truck.tollPer100Km);

    // Hamali / Loading charges (~Rs 180 / MT)
    const hamali = Math.round(weight * 180);

    const minTotal = Math.round(rawMin * commodityFactor + estTolls + hamali);
    const maxTotal = Math.round(rawMax * commodityFactor + estTolls + hamali);

    // Weight conversions: 1 MT = 1,000 kg = 10 quintals
    const totalQuintals = weight * 10;
    const totalKg = weight * 1000;

    const perQuintalMin = Math.round(minTotal / totalQuintals);
    const perQuintalMax = Math.round(maxTotal / totalQuintals);

    const perKgMin = (minTotal / totalKg).toFixed(2);
    const perKgMax = (maxTotal / totalKg).toFixed(2);

    // Transit time: average 40 km/h for commercial trucks in India
    const hours = Math.round(distance / 40);
    const transitTime =
      hours <= 2
        ? "1 - 2 Hours (Same Day Delivery)"
        : hours <= 8
        ? `${hours - 1} - ${hours + 2} Hours (Same Day Delivery)`
        : `${Math.ceil(hours / 24)} - ${Math.ceil(hours / 24) + 1} Days`;

    return NextResponse.json({
      success: true,
      fromCity,
      toCity,
      distanceKm: distance,
      commodity,
      weightMt: weight,
      truckType,
      truckName: truck.name,
      truckCapacity: truck.capacity,
      estimate: {
        minTotal,
        maxTotal,
        baseMin: Math.round(rawMin),
        baseMax: Math.round(rawMax),
        estimatedTolls: estTolls,
        hamaliCharges: hamali,
        perQuintal: `₹${perQuintalMin} - ₹${perQuintalMax}`,
        perKg: `₹${perKgMin} - ₹${perKgMax}`,
        transitTime,
      },
      source: "https://trucksuvidha.com/FreightCalculator.aspx",
      distanceCalculatorUrl: "https://trucksuvidha.com/DistanceCalculator.aspx",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to calculate freight" },
      { status: 500 }
    );
  }
}
