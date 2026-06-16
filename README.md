# DFB Solutions

Creative-tech studio site built with React, Vite, Tailwind CSS, Framer Motion, React Router, and Vercel serverless functions.

## Site Structure

- `/` is the main DFB Solutions business and creative-tech hub.
- `/sound` is the DFB Sound direct-to-community music hub.

The homepage keeps services, builds, apps, visual work, media, and business conversion first. Music appears as a lane inside the DFB universe and funnels into `/sound`.

## DFB Sound

The `/sound` page includes:

- Sound hero
- Featured release for `Friday The 14th`
- Story Behind The Song
- The Free List signup form
- The Vault preview
- Videos & Releases
- Direct support section
- Artist Release Kit CTA

Edit release data in:

```text
src/data/releases.js
```

Edit official URLs in:

```text
src/data/links.js
```

Missing URLs are hidden in the UI. Do not use dead `href="#"` links for DSPs, support links, or socials.

## Required Environment Variables

Set these in Vercel before deploying the contact form and Free List form:

```env
RESEND_API_KEY=replace_with_resend_api_key
CONTACT_TO_EMAIL=you@example.com
CONTACT_FROM_EMAIL=DFB Solutions <onboarding@resend.dev>
```

- `RESEND_API_KEY`: Resend API key used only by serverless routes.
- `CONTACT_TO_EMAIL`: DFB Solutions receiving email address.
- `CONTACT_FROM_EMAIL`: Verified sender or domain email in Resend.

Never expose or commit real API keys. Keep real values in `.env` locally and Vercel environment variables in production.

## API Routes

### `/api/contact`

Handles the main DFB Solutions Start Project form.

### `/api/join-free-list`

Handles the DFB Sound Free List form.

Expected POST fields:

- `email` required, max 200
- `phone` optional, max 50
- `favoritePlatform` optional, max 80
- `source` optional, max 100
- `companyWebsite` honeypot

The endpoint validates the email, respects the honeypot, sends the signup through Resend, and only returns success after Resend accepts the email.

## Resend Setup

1. Create a Resend account.
2. Verify a sender address or sending domain in Resend.
3. Add `RESEND_API_KEY` to the Vercel project environment variables.
4. Add `CONTACT_TO_EMAIL` to the Vercel project environment variables.
5. Add `CONTACT_FROM_EMAIL` using the verified sender/domain value.

## Local Development

Use Vercel CLI when testing API routes locally:

```bash
npm install -g vercel
vercel dev
```

Use Vite for frontend-only work:

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deployment Notes

This project includes `vercel.json` rewrites so React Router routes like `/sound` load through `index.html` while `/api/*` routes remain serverless functions.

Deployment flow:

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add the required environment variables.
4. Deploy.
