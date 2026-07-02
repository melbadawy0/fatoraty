const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export async function sendWhatsAppMessage(to: string, message: string) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body: message },
      }),
    }
  );

  return response.json();
}

export async function downloadMedia(mediaId: string) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${mediaId}`,
    {
      headers: { "Authorization": `Bearer ${WHATSAPP_TOKEN}` },
    }
  );

  const data = await response.json();
  const urlResponse = await fetch(data.url, {
    headers: { "Authorization": `Bearer ${WHATSAPP_TOKEN}` },
  });

  return urlResponse.arrayBuffer();
}
