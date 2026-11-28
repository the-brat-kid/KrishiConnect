import { NextRequest, NextResponse } from "next/server";
import { findNearestMandi, normalizeIndianState } from "@/lib/mandi-regions";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lonStr = searchParams.get("lon");

  const lat = latStr ? parseFloat(latStr) : NaN;
  const lon = lonStr ? parseFloat(lonStr) : NaN;

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { success: false, error: "Valid lat and lon parameters are required." },
      { status: 400 }
    );
  }

  const nearest = findNearestMandi(lat, lon);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1&zoom=14`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "KrishiConnect/1.0 (https://krishiconnect.in)",
        "Accept-Language": "en-IN,en;q=0.9",
      },
      next: { revalidate: 3600 },
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      const addr = data?.address || {};
      const rawLocality =
        addr.suburb ||
        addr.neighbourhood ||
        addr.village ||
        addr.town ||
        addr.city_district ||
        addr.city ||
        addr.county ||
        nearest.mandi.district;
      const rawCity =
        addr.city ||
        addr.town ||
        addr.state_district ||
        addr.county ||
        nearest.mandi.district;
      const district = (addr.state_district || addr.county || rawCity || nearest.mandi.district)
        .replace(/\s+District$/i, "")
        .trim();
      const rawState = addr.state || nearest.mandi.state;
      const normalizedState = normalizeIndianState(rawState) || nearest.mandi.state;

      const labelLocality =
        rawLocality && rawCity && rawLocality.toLowerCase() !== rawCity.toLowerCase()
          ? `${rawLocality}, ${rawCity}`
          : rawLocality || rawCity || nearest.mandi.district;

      return NextResponse.json({
        success: true,
        source: "nominatim",
        lat,
        lon,
        locality: labelLocality,
        city: rawCity || district,
        district,
        state: normalizedState,
        address: data?.display_name || `${labelLocality}, ${district}, ${normalizedState}`,
        nearestMandi: nearest.mandi,
        distanceKm: nearest.distanceKm,
      });
    }
  } catch (err) {
    console.warn("Reverse geocode fallback to nearest mandi:", err);
  }

  // Graceful offline/timeout fallback using nearest regional hub
  return NextResponse.json({
    success: true,
    source: "nearest_mandi_fallback",
    lat,
    lon,
    locality: nearest.mandi.district,
    city: nearest.mandi.district,
    district: nearest.mandi.district,
    state: nearest.mandi.state,
    address: `Near ${nearest.mandi.name}, ${nearest.mandi.state}`,
    nearestMandi: nearest.mandi,
    distanceKm: nearest.distanceKm,
  });
}
