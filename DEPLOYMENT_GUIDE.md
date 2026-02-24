# FamilySync Finance — Complete Deployment Guide for Beginners

## Where Are Your Files Right Now?

All your project files are stored here on your local machine:
```
/home/user/familysync-finance/
├── src/                    ← React app code
├── public/                 ← Images & manifest
├── package.json            ← Dependencies list
├── .env                    ← Supabase credentials (SECRET — don't share)
├── supabase-schema.sql     ← Database setup script
├── index.html              ← Main HTML file
└── vite.config.ts          ← Build configuration
```

**Important:** These files are only on YOUR computer. To use the app on both your phones
(Caleb and Rachel), you need to:
1. Upload the code to GitHub (free, permanent storage in the cloud)
2. Deploy it to Vercel/Netlify (makes it a live website)
3. Set up Supabase (makes it a shared database)

---

## Step-by-Step Deployment (Complete Beginner Guide)

### Phase 1: Set Up Supabase Database (5 minutes)

**What you're doing:** Creating the tables where data is stored.

1. **Open Supabase dashboard**
   - Go to https://supabase.com
   - Log in with your account (you already have one since you gave me the URL + API key)
   - Click on your project (it's at that URL: `mnegasovvcqobwhmeqiu`)

2. **Run the database schema**
   - On the left sidebar, click **SQL Editor**
   - Click **New query**
   - In the file explorer, find `supabase-schema.sql` in your project folder
   - Copy the entire contents of that file
   - Paste it into the Supabase SQL editor
   - Click the blue **Run** button at the bottom right

   **You'll see:** "Success! No rows returned" — this is good!

3. **Verify it worked**
   - Click **Table Editor** on the left sidebar
   - You should see 8 new tables:
     - profiles
     - categories
     - accounts
     - account_groups
     - joint_pools
     - pledges
     - budgets
     - transactions

✅ **Phase 1 complete!** Your database is ready. The app will auto-seed sample data when it first connects.

---

### Phase 2: Upload Code to GitHub (10 minutes)

**What you're doing:** Creating a permanent, shareable home for your code in the cloud.

#### 2A. Create a GitHub Account (if you don't have one)

1. Go to https://github.com
2. Click **Sign up**
3. Follow the steps (email, password, verification)
4. Done!

#### 2B. Upload Your Code

**On your computer (Mac/Linux/Windows):**

Open a terminal/command prompt and run these commands one at a time:

```bash
# Navigate to your project folder
cd /home/user/familysync-finance

# Initialize Git (sets up version control)
git init

# Add all files
git add .

# Create a snapshot with a message
git commit -m "Initial FamilySync Finance app with Supabase"
```

**Then go to GitHub:**

1. Open https://github.com and sign in
2. Click the **+** icon in the top right → **New repository**
3. Repository name: `familysync-finance`
4. Description: "Couples financial collaboration app"
5. Choose **Public** (so you can access it from Vercel later)
6. Click **Create repository**

**Back in your terminal:**

Copy the commands GitHub shows you under "push an existing repository from the command line"
and paste them. They'll look like:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/familysync-finance.git
git push -u origin main
```

**Result:** Your code is now on GitHub! Go to `https://github.com/YOUR_USERNAME/familysync-finance`
and you should see your files there.

✅ **Phase 2 complete!** Your code is backed up in the cloud.

---

### Phase 3: Deploy to Vercel (Get a Live URL) — 5 minutes

**What you're doing:** Taking your code from GitHub and making it into a live website.

#### 3A. Create a Vercel Account

1. Go to https://vercel.com
2. Click **Sign up**
3. Click **Continue with GitHub**
4. Authorize Vercel to access GitHub
5. Done!

#### 3B. Deploy Your App

1. On Vercel, click **Add New...** → **Project**
2. You should see `familysync-finance` in the list of your GitHub repos
3. Click **Import**
4. Under **Environment Variables**, add your Supabase credentials:
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://mnegasovvcqobwhmeqiu.supabase.co`
   - Click **Add**

   Then add the second one:
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `sb_publishable_cuSuPW8er1vo0kwjlMT-2w_0xjoABV9`
   - Click **Add**

5. Click **Deploy**

**Wait for deployment** (takes 1-2 minutes). You'll see a screen with a checkmark and a URL like:
```
https://familysync-finance.vercel.app
```

**Test it:**
- Click that URL
- You should see the FamilySync app loading
- It will auto-seed the sample data from Supabase

✅ **Phase 3 complete!** Your app is live on the internet!

---

### Phase 4: Install on Your iPhones (2 minutes per phone)

**What you're doing:** Adding the web app as an icon on your home screen so it feels like a native app.

#### For iPhone (Caleb's):

1. **Open Safari** (not Chrome, not any other browser)
2. Go to your Vercel URL: `https://familysync-finance.vercel.app`
3. Wait for it to load fully
4. **Tap the Share button** (square with arrow pointing up, usually at the bottom)
5. Scroll down and tap **"Add to Home Screen"**
6. Tap **"Add"** in the top right
7. Done! The app now appears on your home screen with a FamilySync icon

#### For iPhone (Rachel's):

Repeat the same steps with the same URL.

**Important:** Both of you can now:
- Tap the icon to open the app anytime
- The app launches full-screen (looks like a native app)
- All changes sync through Supabase automatically
- Try it: Caleb adds a transaction, refresh Rachel's phone → it appears!

✅ **Phase 4 complete!** Both of you have the app on your phones!

---

## What Each Technology Does

| Technology | What it does | Why we use it |
|---|---|---|
| **React** | The app code itself | Builds the user interface |
| **Supabase** | Cloud database | Stores all your financial data in the cloud |
| **Vercel** | Web hosting | Makes your app accessible via a URL 24/7 |
| **GitHub** | Code storage | Keeps your code backed up and version-controlled |
| **Vite** | Build tool | Packages everything into a fast website |

---

## Troubleshooting

### "I see an error on Vercel"
- Check that you added the environment variables correctly
- The values are case-sensitive — copy/paste carefully
- Click **Redeploy** in Vercel to try again

### "Database not ready" error on the app
This means the `supabase-schema.sql` wasn't run. Go back to **Phase 1** and run it in Supabase SQL Editor.

### "The app loads but no data shows up"
The database exists but might be empty. Go to Settings → Reset All Data. This will seed all sample data.

### "Changes on Caleb's phone don't show on Rachel's"
Refresh Rachel's phone. The app pulls fresh data from Supabase each time you load it.
(Real-time sync is a future feature; for now just refresh.)

### "I can't find the app on my home screen after installing"
Scroll to the last page of your iPhone home screen. New icons appear there.
You can then drag it to a more convenient location.

---

## Making Changes Later

Once everything is deployed, if you want to make changes:

1. Edit files in `/home/user/familysync-finance/`
2. Run: `git add . && git commit -m "Your message" && git push`
3. Vercel automatically redeploys (takes 1-2 minutes)
4. Refresh your browsers/phones to see changes

---

## Costs

- **GitHub:** Free ✅
- **Vercel:** Free ✅
- **Supabase (anon key):** Free tier covers personal projects ✅
- **Total:** $0/month

You only pay if you get thousands of users. For a couples app, you're well within free limits.

---

## Quick Reference Checklist

- [ ] Run `supabase-schema.sql` in Supabase dashboard
- [ ] Create GitHub account & push code
- [ ] Create Vercel account & import project
- [ ] Add environment variables in Vercel
- [ ] Deploy to Vercel (get your URL)
- [ ] Test the URL in Safari
- [ ] Install on both iPhones (Add to Home Screen)
- [ ] Try adding a transaction and refresh the other phone

---

## Need Help?

If you get stuck on any step, let me know:
1. **Which step** are you on?
2. **What error message** do you see (if any)?
3. **What did you try?**

I can help you debug!
