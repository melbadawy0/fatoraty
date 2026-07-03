import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "fatoraty-verify";

// GET: Webhook verification for Meta
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    console.log("Webhook verification request:", { mode, token, challenge });

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified successfully");
      return new NextResponse(challenge, { status: 200 });
    }

    console.log("Webhook verification failed:", { mode, token, expected: VERIFY_TOKEN });
    return new NextResponse("Forbidden", { status: 403 });
  } catch (error) {
    console.error("Webhook GET error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}

// POST: Receive WhatsApp messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body, null, 2));

    // For now, just acknowledge receipt
    // In production, you would process the message here
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook POST error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
