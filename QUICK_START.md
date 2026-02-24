# FamilySync Finance — Quick Start Checklist

## ✅ Pre-Deployment Checklist

Before you begin, make sure you have:
- [ ] Your Supabase URL: `https://mnegasovvcqobwhmeqiu.supabase.co` ✓
- [ ] Your Supabase API Key: `sb_publishable_cuSuPW8er1vo0kwjlMT-2w_0xjoABV9` ✓
- [ ] A GitHub account (or sign up at https://github.com)
- [ ] No GitHub account needed to test locally

---

## 🚀 5-Minute Deploy (Absolute Fastest Path)

### Step 1: Set Up Database (2 minutes)

```
1. Open: https://supabase.com
2. Log in → Click your project
3. Left sidebar → SQL Editor → New query
4. Open file: supabase-schema.sql
5. Copy entire contents
6. Paste into Supabase
7. Click blue "Run" button
✓ Done! Tables are created.
```

### Step 2: Create GitHub Account (1 minute)

```
1. Go to: https://github.com
2. Click "Sign up"
3. Follow steps (email, password, verify)
✓ Account created.
```

### Step 3: Push Code to GitHub (1 minute)

Open terminal/command prompt:

```bash
cd /home/user/familysync-finance
git init
git add .
git commit -m "Initial FamilySync app"
```

On GitHub.com:
```
1. Click + → New repository
2. Name: familysync-finance
3. Public: Yes
4. Create repository
```

Back in terminal, copy the commands GitHub shows and paste them.
They look like:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/familysync-finance.git
git push -u origin main
```

✓ Code is on GitHub!

### Step 4: Deploy to Vercel (1 minute)

```
1. Go to: https://vercel.com
2. Click "Sign up"
3. Click "Continue with GitHub"
4. Authorize Vercel
5. Click "Add New..." → Project
6. Click familysync-finance
7. Click "Import"
8. Environment Variables:
   - VITE_SUPABASE_URL: https://mnegasovvcqobwhmeqiu.supabase.co
   - VITE_SUPABASE_ANON_KEY: sb_publishable_cuSuPW8er1vo0kwjlMT-2w_0xjoABV9
9. Click "Deploy"
10. Wait 2 minutes...
✓ Live! You have a URL like: https://familysync-finance.vercel.app
```

---

## 📱 Install on iPhones

### Caleb's iPhone:
```
1. Open Safari (not Chrome)
2. Go to: https://familysync-finance.vercel.app
3. Wait for it to load
4. Tap Share button (arrow up from bottom)
5. Scroll → "Add to Home Screen"
6. Tap "Add"
✓ Icon appears on home screen
```

### Rachel's iPhone:
```
Repeat same steps with same URL
✓ Both have the app!
```

---

## ✨ Test It Works

1. Caleb: Open app → Settings → Reset All Data
   - App auto-seeds sample data
   - You should see Ledger with January/February 2026 transactions

2. Caleb: Ledger tab → Tap + → Add transaction (e.g., "Coffee - $5")

3. Rachel: Open same URL on her iPhone

4. Rachel: Refresh page (pull down)
   - Caleb's new transaction appears!

✅ **Everything works! You're done.**

---

## 🔧 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Database not ready" error | Run supabase-schema.sql in Supabase SQL Editor |
| No data showing | Go to Settings → Reset All Data |
| Can't see Caleb's changes on Rachel's phone | Refresh Rachel's browser/app |
| Environment variables not working | Wait 5 min after adding them in Vercel |
| Code changes not showing | Hard refresh (Ctrl+Shift+R on desktop, or force close app on iPhone) |
| Forgot GitHub password | Click "Forgot password?" on GitHub login |

---

## 📚 After Deployment: Making Changes

### Edit & Update Code:

```bash
# 1. Edit files in your editor
# 2. Then:
cd /home/user/familysync-finance
git add .
git commit -m "Describe your change"
git push

# 3. Vercel automatically redeploys (takes 1-2 min)
# 4. Refresh your browsers to see changes
```

---

## 💾 File Locations

```
Your project folder:
/home/user/familysync-finance/

Key files:
├── .env                      ← Supabase credentials (DON'T SHARE!)
├── supabase-schema.sql       ← Run this once in Supabase
├── src/                      ← All your React code
├── package.json              ← Dependencies
├── vite.config.ts            ← Build config
└── index.html                ← Main file
```

---

## 🆘 Need Help?

**If you get stuck, tell me:**

1. What step you're on (1-10)
2. The exact error message (screenshot helps!)
3. What you tried already

I can debug anything!

---

## 🎯 Success Indicators

You'll know it's working when:

- ✅ You have a Vercel URL (e.g., `https://familysync-finance.vercel.app`)
- ✅ Opening it in Safari shows the FamilySync app
- ✅ The Ledger displays sample transactions (Jan/Feb 2026)
- ✅ You can add new transactions
- ✅ The app icon appears on your iPhone home screen
- ✅ Both iPhones see the same data after refresh

---

## 📋 Final Deployment Summary

| Technology | Where | Purpose | Cost |
|---|---|---|---|
| GitHub | github.com | Store code | Free |
| Vercel | vercel.com | Host website | Free |
| Supabase | supabase.com | Database | Free |
| **Total** | **3 services** | **Live app** | **$0** |

---

## 🎉 Congrats!

You now have:
- ✅ A full-featured couples finance app
- ✅ Cloud database (data shared between phones)
- ✅ Live on the internet 24/7
- ✅ Zero cost
- ✅ Professional setup (can scale anytime)

**Enjoy managing finances together!** 💰💑
