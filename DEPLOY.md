# FamilySync Finance — Deployment Guide

## How Data Works

All data is stored in **Supabase** (your cloud Postgres database).

- Data is shared across all devices — Caleb and Rachel use the **same database**
- Changes persist permanently in the cloud; nothing is lost between sessions
- The app **auto-seeds** sample data on the very first load
- Use **Settings > Reset All Data** to restore the original sample data

---

## Step 0: Run the Supabase Schema (required, one-time)

Before deploying or testing locally, run the schema in your Supabase dashboard:

1. Go to [supabase.com](https://supabase.com) → open your project
2. Click **SQL Editor** in the left sidebar → **New query**
3. Paste the entire contents of **`supabase-schema.sql`** from this project
4. Click **Run**

This creates all 8 tables and sets access policies. The app seeds sample data
automatically when it first connects.

---

## Option 1: Deploy to Vercel (Recommended — Free)

Vercel gives you a live HTTPS URL in under 2 minutes.

### Method A: Via Git (easiest ongoing updates)

```bash
# 1. Initialize a git repo and push to GitHub
cd familysync-finance
git init
git add .
git commit -m "Initial commit"
gh repo create familysync-finance --public --push --source=.
```

2. Go to [vercel.com](https://vercel.com) → sign in with GitHub
3. Click **Import Project** → select your repo
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://mnegasovvcqobwhmeqiu.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_cuSuPW8er1vo0kwjlMT-2w_0xjoABV9`
5. Click **Deploy** — done! You'll get a URL like `https://familysync-finance.vercel.app`

> **Important:** Never commit the `.env` file to Git. Always set secrets via
> the Vercel dashboard's Environment Variables panel.

### Method B: Via Vercel CLI (no Git needed)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Build the project
npm run build

# 3. Deploy (follow prompts, add env vars when asked)
vercel deploy --prod
```

---

## Option 2: Deploy to Netlify (Free)

```bash
# 1. Build the project
npm run build
```

Then either:
- **Drag & drop:** go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the `dist/` folder

- **Or Netlify CLI:**
  ```bash
  npm install -g netlify-cli
  netlify deploy --prod --dir=dist
  ```

After deploying, go to **Site Settings → Environment Variables** in the Netlify
dashboard and add:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Then trigger a redeploy.

---

## Option 3: Deploy to GitHub Pages (Free)

```bash
# 1. Install the deploy plugin
npm install -D gh-pages

# 2. Add to package.json scripts:
#    "deploy": "npm run build && gh-pages -d dist"

# 3. Add base to vite.config.ts:
#    base: '/familysync-finance/',

# 4. Deploy
npm run deploy
```

> Note: GitHub Pages doesn't support server-side environment variables.
> The Supabase anon key is safe to expose in the browser bundle since
> Row Level Security policies control all database access.

---

## Install on iPhone (PWA — Add to Home Screen)

Once deployed:

1. Open your deployed URL in **Safari** on your iPhone
2. Tap the **Share button** (square with arrow pointing up) at the bottom
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"** in the top right

The app will:
- Appear on your home screen with the FamilySync icon
- Launch in **full-screen mode** (no browser UI)
- Feel like a native app
- Share data with your partner's phone in real-time via Supabase

> Use **Safari only** — Chrome on iOS does not support PWA home screen install.

---

## Install on Android

1. Open the URL in **Chrome**
2. Chrome shows a banner: **"Add FamilySync Finance to Home screen"**
3. Tap **Install**

---

## Custom Domain (Optional)

Both Vercel and Netlify support free custom domains:

1. Buy a domain (Namecheap, Cloudflare, etc.)
2. In your Vercel/Netlify dashboard → Settings → Domains
3. Add your domain and update DNS records as instructed

Example: `finance.yourdomain.com`

---

## Local Development

```bash
cd familysync-finance
npm install
npm run dev      # starts at http://localhost:5173
```

The `.env` file is already configured with your Supabase credentials.
