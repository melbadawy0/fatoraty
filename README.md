# Fatoraty - Invoice Manager via WhatsApp

## What is it?
A WhatsApp bot that helps small businesses manage invoices. Users send invoice photos via WhatsApp, and the bot extracts, organizes, and generates reports.

## Features
- 📸 Send invoice photos via WhatsApp
- 🤖 AI-powered invoice analysis
- 📊 Monthly reports by category
- 📥 Export to Excel/CSV
- 💎 Premium plan ($5/month)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.local.example` to `.env.local` and fill in your keys.

### 3. Run locally
```bash
npm run dev
```

### 4. Deploy to Vercel
```bash
vercel --prod
```

### 5. Connect WhatsApp
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a WhatsApp app
3. Add your webhook URL: `https://your-domain.com/api/webhook`
4. Set verify token: `fatoraty-verify`

## Tech Stack
- Next.js 14
- Firebase (Firestore + Storage)
- OpenAI GPT-4o-mini
- WhatsApp Cloud API
- Tailwind CSS

## Pricing
- **Free**: 30 invoices/month
- **Premium**: $5/month unlimited

## Support
For questions, contact: support@fatoraty.com
