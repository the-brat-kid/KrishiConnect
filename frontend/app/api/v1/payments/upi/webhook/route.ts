import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const contentType = req.headers.get("content-type") || "application/json";

    const backendUrl =
      process.env.BACKEND_URL ||
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "";

    if (backendUrl && !backendUrl.includes("localhost")) {
      try {
        const response = await fetch(`${backendUrl}/api/v1/payments/upi/webhook`, {
          method: "POST",
          headers: {
            "Content-Type": contentType,
          },
          body: rawBody,
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
      } catch (proxyError: any) {
        console.error("Failed to forward webhook to backend:", proxyError);
      }
    }

    // Try parsing the body for diagnostics
    let parsed: any = null;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      parsed = { raw: rawBody };
    }

    return NextResponse.json({
      status: "received",
      message: "Webhook delivered to KrishiConnect edge router. If using local FastAPI backend, please point companion app to your Cloudflare Tunnel URL.",
      payload: parsed,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    message: "KrishiConnect FreePay UPI Webhook endpoint is live.",
    endpoints: {
      post_webhook: "/api/v1/payments/upi/webhook",
      post_direct: "/webhook/payment",
    },
  });
}
