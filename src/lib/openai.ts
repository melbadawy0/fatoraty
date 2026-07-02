import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeInvoice(imageUrl: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an invoice analyzer. Extract the following from invoice images and return ONLY a JSON object with this structure:
{
  "invoiceNumber": "string",
  "date": "YYYY-MM-DD",
  "vendor": "string",
  "items": [{"name": "string", "quantity": number, "price": number}],
  "total": number,
  "currency": "string",
  "category": "string (food, electronics, clothing, services, other)"
}
If any field is unclear, use null or best guess.`,
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze this invoice image and extract all details." },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content || "";

  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error("Failed to parse invoice");
}

export async function generateMonthlyReport(invoices: any[]) {
  const total = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const byCategory: Record<string, number> = {};

  invoices.forEach((inv) => {
    const cat = inv.category || "other";
    byCategory[cat] = (byCategory[cat] || 0) + (inv.total || 0);
  });

  const topCategory = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "other";

  return {
    totalInvoices: invoices.length,
    totalAmount: total,
    byCategory,
    topCategory,
    averagePerInvoice: invoices.length > 0 ? total / invoices.length : 0,
  };
}
