import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url =
    process.env.BACKEND_URL ||
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "none";

  return NextResponse.json({
    backend_url: url,
    all_keys: Object.keys(process.env).filter((k) => !k.toLowerCase().includes("secret") && !k.toLowerCase().includes("key")),
  });
}
