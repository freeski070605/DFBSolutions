# DFB Solutions

Creative-tech studio site built with React, Vite, Tailwind CSS, Framer Motion, React Router, and Vercel serverless functions.

## MongoDB Cloud CRM

The private CRM is available at `/admin`. It manages:

- Website portfolio projects, cover images, galleries, videos, live links, publishing, and featured state
- Public division copy, capabilities, process steps, and FAQs
- Website inquiries and their pipeline status
- Customer records, notes, tags, and associated divisions
- Bookings and active projects, dates, private locations/routes, payment state, deliverables, and itineraries

Public inquiries are persisted in MongoDB before the API reports success. Email notification through Resend is optional.

### MongoDB Cloud / Atlas setup

1. Create a MongoDB Atlas project and database deployment.
2. Create a database user with read/write access to the `dfb_solutions` database.
3. Add network access for the Vercel deployment. Atlas must accept connections from the deployment environment.
4. Copy the Node.js SRV connection string. URL-encode special characters in the database password.
5. Copy `.env.example` to `.env.local` for local development and fill in:

```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB=dfb_solutions
AUTH_SECRET=at-least-32-random-characters
ADMIN_SETUP_KEY=a-long-one-time-setup-key
```

The application temporarily recognizes the legacy lowercase `mongo_uri` variable as well, but `MONGODB_URI` is the recommended name for local and Vercel configuration.

Generate a strong authentication secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Add the same variables in Vercel Project Settings → Environment Variables.

### Create the first administrator

1. Run the site with `vercel dev` so the serverless APIs are available locally, or deploy it to Vercel.
2. Open `/admin`.
3. Select **First-time setup**.
4. Enter the owner name, email, a password of at least 12 characters, and the value of `ADMIN_SETUP_KEY`.
5. Sign in and use **Import current projects** on the overview screen.
6. Remove `ADMIN_SETUP_KEY` from local and Vercel environments after the account is created, then redeploy.

The setup endpoint refuses to create another owner once an administrator exists.

### Portfolio media

The portfolio editor accepts:

- Cover image URLs
- Gallery rows in the format `image URL | descriptive alt text`
- YouTube or direct video URLs
- Live website URLs and custom button labels

For production media, use a CDN or media host and save its URLs in the CRM. MongoDB stores the content records and metadata; large original video files should not be stored directly in ordinary MongoDB documents.

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

All public API URLs are dispatched through one consolidated Vercel Function at `api/index.js`. Route implementations and shared database code live under `server/api/`, outside Vercel's deployable `/api` directory. This keeps the deployment within the Hobby plan's Serverless Function count while preserving the URLs below.

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
