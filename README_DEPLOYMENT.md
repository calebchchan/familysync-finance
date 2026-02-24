# 📱 FamilySync Finance — Deployment Documentation

## TL;DR — The 30-Second Version

1. **Run SQL in Supabase Dashboard** (2 min)
   - File: `supabase-schema.sql`

2. **Push code to GitHub** (2 min)
   - Commands in `QUICK_START.md`

3. **Deploy to Vercel** (2 min)
   - Add environment variables
   - Click Deploy

4. **Install on iPhones** (2 min each)
   - Safari → Share → Add to Home Screen

**Total time: ~10 minutes**

---

## 📂 Where Your Files Are

```
Your local computer:
/home/user/familysync-finance/
  ├── src/                ← React source code
  ├── public/             ← Images & manifest
  ├── .env                ← Supabase keys (keep secret!)
  ├── package.json        ← Dependencies
  ├── supabase-schema.sql ← Database setup (RUN THIS FIRST)
  └── [other files]
```

**These files are ONLY on your computer right now.**
To use on both phones, they need to be:
- ✅ Uploaded to GitHub (backup)
- ✅ Deployed to Vercel (live website)
- ✅ Connected to Supabase (shared database)

---

## 📚 Which Guide to Read?

| Guide | Best For | Read Time |
|-------|----------|-----------|
| **QUICK_START.md** | "Just tell me the steps" | 5 min |
| **DEPLOYMENT_GUIDE.md** | "I'm completely new to this" | 15 min |
| **ARCHITECTURE.md** | "I want to understand how it works" | 10 min |
| **THIS FILE** | "Overview & file locations" | 3 min |

---

## 🔑 Your Supabase Credentials

You already have these (you gave them to me):

```
URL:    https://mnegasovvcqobwhmeqiu.supabase.co
Key:    sb_publishable_cuSuPW8er1vo0kwjlMT-2w_0xjoABV9
```

✅ These are in your `.env` file (don't share this file!)
✅ You'll paste these into Vercel environment variables

---

## 🎯 Deployment Roadmap

```
START
  ↓
[1] Set up Supabase database
    └─ Run supabase-schema.sql
  ↓
[2] Create GitHub account
  ↓
[3] Push code to GitHub
    └─ git commands
  ↓
[4] Create Vercel account
  ↓
[5] Deploy to Vercel
    └─ Connect GitHub
    └─ Add env variables
  ↓
[6] Get live URL
    └─ https://familysync-finance.vercel.app
  ↓
[7] Install on Caleb's iPhone
    └─ Safari → Share → Add to Home Screen
  ↓
[8] Install on Rachel's iPhone
    └─ Same steps
  ↓
SUCCESS!
Both phones can use the shared app.
```

---

## 🚀 Step-by-Step Overview

### Step 1: Supabase Setup (Database)
**Why:** Creates the tables where your financial data lives
**Time:** 2 minutes
**File needed:** `supabase-schema.sql`
**Action:**
1. Open Supabase dashboard
2. SQL Editor → New query
3. Paste `supabase-schema.sql`
4. Click Run
**Check:** You should see 8 tables in Table Editor

### Step 2: GitHub Setup (Code Backup)
**Why:** Stores your code in the cloud & tracks changes
**Time:** 3 minutes
**What you need:** GitHub account
**Action:**
1. Create GitHub account
2. Run git commands from terminal
**Check:** Your code appears on GitHub.com

### Step 3: Vercel Deploy (Live Website)
**Why:** Makes your app accessible via a URL 24/7
**Time:** 3 minutes
**What you need:** Vercel account (+ GitHub connected)
**Action:**
1. Sign up on Vercel
2. Import your GitHub repo
3. Add environment variables
4. Click Deploy
**Check:** You get a live URL like `https://familysync-finance.vercel.app`

### Step 4: iPhone Installation (Mobile App)
**Why:** Makes it easy to use on phones (like a native app)
**Time:** 2 minutes per phone
**What you need:** Safari browser on iPhone
**Action:**
1. Open Vercel URL in Safari
2. Share → Add to Home Screen
3. Tap Add
**Check:** App appears on home screen

---

## 🔐 Security & Privacy

### What's Safe to Share
- Your Vercel URL (`https://familysync-finance.vercel.app`)
- Your GitHub repository (if public)

### What's SECRET (Never Share)
- `.env` file
- Supabase API key
- Any credentials

### How Data is Protected
- Row Level Security policies in Supabase
- Only you and your partner can access the database
- Supabase encrypts data at rest
- HTTPS (encrypted in transit)

---

## 💰 Costs

| Service | Free Tier | Cost |
|---------|-----------|------|
| Supabase | ✅ Generous | $0 for personal use |
| Vercel | ✅ Unlimited | $0 (includes auto-redeploys) |
| GitHub | ✅ Unlimited | $0 |
| **Total** | | **$0/month** |

You only pay if you scale to thousands of users.

---

## 📱 Cross-Device Experience

### Caleb's iPhone
```
Opens: https://familysync-finance.vercel.app
Or: Taps home screen icon
↓
Sees: His personal transactions + shared joint transactions
↓
Can: Add expenses, set budgets, view net worth
↓
Changes sync to: Rachel's phone (after she refreshes)
```

### Rachel's iPhone
```
Opens: Same URL
↓
Sees: Her personal transactions + shared joint transactions
↓
Can: Same features
↓
Changes sync to: Caleb's phone (after he refreshes)
```

**Note:** Both phones read/write the same Supabase database.

---

## 🔄 Keeping Your Code Updated

After deployment, to make changes:

```bash
# 1. Edit files locally
# 2. Then:
cd /home/user/familysync-finance
git add .
git commit -m "Description of change"
git push
# 3. Vercel auto-redeploys
# 4. Both phones see changes on refresh
```

No manual deploy needed — Vercel watches GitHub!

---

## 🆘 Troubleshooting Quick Links

| Problem | Solution |
|---------|----------|
| "Database not ready" | Run `supabase-schema.sql` in Supabase SQL Editor |
| Can't find supabase-schema.sql | It's in `/home/user/familysync-finance/` |
| Git commands not working | Install Git from git-scm.com, then try again |
| No data in app | Go to Settings → Reset All Data |
| Can't see recent changes | Hard refresh (Ctrl+Shift+R) or close app |
| Vercel deployment failed | Check that environment variables were added |

---

## 📖 Full Documentation Files

Each file in your project explains something:

### Config Files
- `package.json` — dependencies & scripts
- `vite.config.ts` — build configuration
- `tsconfig.json` — TypeScript settings
- `.env` — environment variables (local only)
- `.gitignore` — what not to upload to Git

### App Files
- `index.html` — main HTML (PWA manifest)
- `src/main.tsx` — entry point
- `src/App.tsx` — root component
- `src/components/` — all UI components
- `src/context/` — global state
- `src/services/` — Supabase API calls
- `src/lib/` — utilities
- `src/types/` — TypeScript interfaces

### Documentation (YOU NEED THESE!)
- `QUICK_START.md` ← Read this first!
- `DEPLOYMENT_GUIDE.md` ← Detailed walkthrough
- `ARCHITECTURE.md` ← How it all works
- `DEPLOY.md` ← Original deployment notes
- `supabase-schema.sql` ← Database setup

---

## ✅ Verification Checklist

After each step, check:

**After Supabase Setup:**
- [ ] Can open Supabase dashboard
- [ ] See 8 tables in Table Editor
- [ ] No SQL errors

**After GitHub Push:**
- [ ] Code appears on GitHub.com
- [ ] Can see all files on GitHub

**After Vercel Deploy:**
- [ ] Have a live URL
- [ ] URL works in browser
- [ ] Can see the FamilySync app

**After iPhone Install:**
- [ ] Icon appears on home screen
- [ ] Can open app from icon
- [ ] Can see sample data (or reset to seed it)

**After Cross-Device Test:**
- [ ] Both phones see same URL
- [ ] Can add transaction on one phone
- [ ] Other phone sees it after refresh

---

## 🎓 Learning Resources

If you want to understand the tech better:

- **React basics:** https://react.dev (free tutorial)
- **Supabase docs:** https://supabase.com/docs (very beginner-friendly)
- **Vercel deployment:** https://vercel.com/docs (quick start guides)
- **TypeScript:** https://www.typescriptlang.org/docs (for type safety)

**But you don't need to learn these — the app already works!**

---

## 🎉 You're All Set!

Everything you need is in your `/home/user/familysync-finance/` folder.

**Next steps:**
1. Read `QUICK_START.md` (5 minutes)
2. Follow the steps
3. Enjoy your shared finance app!

If you have any questions, I'm here to help. Just ask!

---

**Created with ❤️ for couples to manage finances together.**
