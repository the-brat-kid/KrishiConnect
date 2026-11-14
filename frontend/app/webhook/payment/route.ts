import { NextRequest, NextResponse } from "next/server";
import { POST as handleWebhook, GET as handleGet } from "@/app/api/v1/payments/upi/webhook/route";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return handleWebhook(req);
}

export async function GET() {
  return handleGet();
}
