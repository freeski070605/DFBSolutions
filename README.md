# DFB Solutions

Creative-tech studio site built with React, Vite, Tailwind CSS, Framer Motion, and Vercel serverless functions.

## Required Environment Variables

Set these in Vercel before deploying the contact form:

```env
RESEND_API_KEY=replace_with_resend_api_key
CONTACT_TO_EMAIL=you@example.com
CONTACT_FROM_EMAIL=DFB Solutions <onboarding@resend.dev>
```

- `RESEND_API_KEY`: Resend API key used only by the `/api/contact` serverless route.
- `CONTACT_TO_EMAIL`: DFB Solutions receiving email address.
- `CONTACT_FROM_EMAIL`: Verified sender or domain email in Resend.

Never expose or commit real API keys.

## Resend Setup

1. Create a Resend account.
2. Verify a sender address or sending domain in Resend.
3. Add `RESEND_API_KEY` to the Vercel project environment variables.
4. Add `CONTACT_TO_EMAIL` to the Vercel project environment variables.
5. Add `CONTACT_FROM_EMAIL` using the verified sender/domain value.

## Local Development

Use Vercel CLI when testing the API route locally:

```bash
npm install -g vercel
vercel dev
```

The Vite frontend and `/api/contact` serverless route will run together through `vercel dev`.

## Build

```bash
npm run build
```

## Deployment

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add the required environment variables.
4. Deploy.
