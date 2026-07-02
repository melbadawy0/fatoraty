import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const format = searchParams.get("format") || "json";

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const invoicesRef = collection(db, "invoices");
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const q = query(
      invoicesRef,
      where("userId", "==", userId),
      where("createdAt", ">=", Timestamp.fromDate(startOfMonth))
    );

    const snap = await getDocs(q);
    const invoices = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (format === "excel") {
      // Return JSON that frontend will convert to Excel
      return NextResponse.json({
        type: "excel",
        data: invoices,
        filename: `fatoraty-report-${now.getFullYear()}-${now.getMonth() + 1}.json`,
      });
    }

    if (format === "pdf") {
      return NextResponse.json({
        type: "pdf",
        data: invoices,
        filename: `fatoraty-report-${now.getFullYear()}-${now.getMonth() + 1}.json`,
      });
    }

    // Default JSON
    const total = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const byCategory: Record<string, number> = {};
    invoices.forEach((inv) => {
      const cat = inv.category || "other";
      byCategory[cat] = (byCategory[cat] || 0) + (inv.total || 0);
    });

    return NextResponse.json({
      month: now.toLocaleString("default", { month: "long", year: "numeric" }),
      totalInvoices: invoices.length,
      totalAmount: total,
      byCategory,
      invoices,
    });

  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
