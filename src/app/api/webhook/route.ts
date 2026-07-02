import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, Timestamp, updateDoc, doc } from "firebase/firestore";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { analyzeInvoice } from "@/lib/openai";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "fatoraty-verify";

// GET: Webhook verification
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// POST: Receive WhatsApp messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ status: "ok" });
    }

    const message = messages[0];
    const from = message.from;
    const type = message.type;

    // Get or create user
    const usersRef = collection(db, "users");
    const userQuery = query(usersRef, where("phone", "==", from));
    const userSnap = await getDocs(userQuery);

    let userId: string;
    let userData: any = {};

    if (userSnap.empty) {
      // New user - create with free tier
      const newUser = await addDoc(usersRef, {
        phone: from,
        createdAt: Timestamp.now(),
        plan: "free",
        invoicesUsed: 0,
        invoicesLimit: 30,
        name: null,
        businessName: null,
      });
      userId = newUser.id;
      userData = { plan: "free", invoicesUsed: 0, invoicesLimit: 30 };

      await sendWhatsAppMessage(from, `👋 Welcome to Fatoraty!

I help you organize invoices and track expenses.

📸 Send me an invoice image
📊 Get monthly reports
📁 Download Excel/PDF

✅ Free: 30 invoices/month
💎 Premium: Unlimited - $5/month

Send an invoice photo to start!`);
    } else {
      const userDoc = userSnap.docs[0];
      userId = userDoc.id;
      userData = userDoc.data();
    }

    // Handle text messages (commands)
    if (type === "text") {
      const text = message.text?.body?.toLowerCase() || "";

      if (text === "report" || text === "تقرير") {
        return await handleReportRequest(from, userId);
      } else if (text === "upgrade" || text === "ترقية") {
        return await handleUpgradeRequest(from, userId);
      } else if (text === "help" || text === "مساعدة") {
        await sendWhatsAppMessage(from, `📋 Commands:
• Send invoice photo → Analyze & save
• "report" → Monthly summary
• "upgrade" → Premium plan
• "help" → This message`);
        return NextResponse.json({ status: "ok" });
      } else {
        await sendWhatsAppMessage(from, `🤔 I didn't understand.

Send me an invoice photo or type:
• "report" for summary
• "upgrade" for premium
• "help" for commands`);
        return NextResponse.json({ status: "ok" });
      }
    }

    // Handle image messages (invoices)
    if (type === "image") {
      // Check limits
      if (userData.plan === "free" && userData.invoicesUsed >= userData.invoicesLimit) {
        await sendWhatsAppMessage(from, `⚠️ Free limit reached!

You've used ${userData.invoicesUsed}/${userData.invoicesLimit} invoices.

💎 Upgrade to Premium for unlimited invoices:
• $5/month
• Unlimited invoices
• Excel & PDF exports
• Priority support

Type "upgrade" to upgrade.`);
        return NextResponse.json({ status: "ok" });
      }

      await sendWhatsAppMessage(from, `⏳ Analyzing your invoice...`);

      // Get image URL from WhatsApp
      const imageId = message.image?.id;
      const imageUrl = `https://graph.facebook.com/v18.0/${imageId}`;

      // For now, use a placeholder approach - in production you'd download and upload to Firebase Storage
      // Then get a public URL to pass to OpenAI

      try {
        // Simulate invoice analysis (in production, download image, upload to storage, get URL, then analyze)
        const invoiceData = {
          invoiceNumber: `INV-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          vendor: "Unknown Vendor",
          items: [{ name: "Item from invoice", quantity: 1, price: 0 }],
          total: 0,
          currency: "EGP",
          category: "other",
        };

        // Save to Firestore
        const invoicesRef = collection(db, "invoices");
        await addDoc(invoicesRef, {
          userId,
          phone: from,
          ...invoiceData,
          imageId,
          createdAt: Timestamp.now(),
          status: "analyzed",
        });

        // Update user invoice count
        await updateDoc(doc(db, "users", userId), {
          invoicesUsed: (userData.invoicesUsed || 0) + 1,
        });

        const remaining = (userData.invoicesLimit || 30) - (userData.invoicesUsed || 0) - 1;

        await sendWhatsAppMessage(from, `✅ Invoice saved!

🧾 #${invoiceData.invoiceNumber}
📅 ${invoiceData.date}
💰 ${invoiceData.total} ${invoiceData.currency}
📂 Category: ${invoiceData.category}

📊 Remaining: ${remaining} free invoices

Type "report" for monthly summary.`);

      } catch (error) {
        console.error("Analysis error:", error);
        await sendWhatsAppMessage(from, `❌ Sorry, I couldn't analyze this invoice. Please try again with a clearer photo.`);
      }

      return NextResponse.json({ status: "ok" });
    }

    return NextResponse.json({ status: "ok" });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ status: "error", message: "Internal error" }, { status: 500 });
  }
}

async function handleReportRequest(phone: string, userId: string) {
  try {
    const invoicesRef = collection(db, "invoices");
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const q = query(
      invoicesRef,
      where("userId", "==", userId),
      where("createdAt", ">=", Timestamp.fromDate(startOfMonth))
    );

    const snap = await getDocs(q);
    const invoices = snap.docs.map((d) => d.data());

    const total = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const count = invoices.length;

    const byCategory: Record<string, number> = {};
    invoices.forEach((inv) => {
      const cat = inv.category || "other";
      byCategory[cat] = (byCategory[cat] || 0) + (inv.total || 0);
    });

    let categoryText = "";
    Object.entries(byCategory).forEach(([cat, amount]) => {
      categoryText += `• ${cat}: ${amount.toFixed(2)} EGP\n`;
    });

    await sendWhatsAppMessage(phone, `📊 Monthly Report (${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()})\n\n🧾 Total Invoices: ${count}\n💰 Total Spent: ${total.toFixed(2)} EGP\n\n📂 By Category:\n${categoryText || "No data"}\n\n📥 Download full report:\nfatoraty.vercel.app/dashboard`);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Report error:", error);
    await sendWhatsAppMessage(phone, `❌ Could not generate report. Please try again later.`);
    return NextResponse.json({ status: "error" });
  }
}

async function handleUpgradeRequest(phone: string, userId: string) {
  await sendWhatsAppMessage(phone, `💎 Fatoraty Premium\n\n✅ Unlimited invoices\n✅ Excel & PDF exports\n✅ Priority support\n✅ Advanced analytics\n\n💰 $5/month or $50/year\n\nUpgrade here:\nfatoraty.vercel.app/upgrade?user=${userId}\n\nOr pay via:
• Vodafone Cash: 0100XXXXXXX
• InstaPay: fatoraty@instapay`);

  return NextResponse.json({ status: "ok" });
}
