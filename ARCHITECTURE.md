# FamilySync Finance — Architecture Overview

## How Everything Works Together

```
┌─────────────────────────────────────────────────────────────────┐
│                     YOUR LOCAL MACHINE                          │
│                                                                 │
│  /home/user/familysync-finance/   ← Project folder            │
│  ├─ src/                           ← React code               │
│  ├─ .env                           ← Secrets (never share!)   │
│  └─ supabase-schema.sql            ← Database setup          │
│                                                                 │
│  npm run dev                       ← Test locally             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    (git push to GitHub)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        GITHUB.COM                               │
│                  (Cloud code storage)                           │
│                                                                 │
│  github.com/YOUR_USERNAME/familysync-finance                  │
│  ├─ All your source files                                      │
│  └─ Version history (can rollback anytime)                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    (Vercel watches GitHub)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL.COM                                 │
│                  (Hosting / Live URL)                           │
│                                                                 │
│  https://familysync-finance.vercel.app                         │
│  ├─ Builds & runs your app                                     │
│  ├─ Serves to iPhones 24/7                                     │
│  └─ Environment variables injected here                        │
│      (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                 (App connects via REST API)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   SUPABASE.COM                                  │
│              (Cloud PostgreSQL Database)                        │
│                                                                 │
│  https://mnegasovvcqobwhmeqiu.supabase.co                      │
│  ├─ profiles table      (Caleb & Rachel)                       │
│  ├─ transactions table  (all spending & income)                │
│  ├─ accounts table      (checking, savings, credit cards)      │
│  ├─ categories table    (Groceries, Dining, etc.)             │
│  ├─ joint_pools table   (Rent, Europe Trip, etc.)             │
│  ├─ pledges table       (commitments to pools)                │
│  ├─ budgets table       (spending limits per category)        │
│  └─ account_groups table (Bank, Credit, Wallet)              │
│                                                                 │
│  Data is shared between both phones via this database          │
└─────────────────────────────────────────────────────────────────┘
                              ↑
            (Caleb's iPhone & Rachel's iPhone both read/write)
                              ↑
┌──────────────────────┐  ┌──────────────────────┐
│   CALEB'S iPHONE     │  │   RACHEL'S iPHONE    │
├──────────────────────┤  ├──────────────────────┤
│                      │  │                      │
│ Safari or Home       │  │ Safari or Home       │
│ Screen Icon          │  │ Screen Icon          │
│                      │  │                      │
│ Opens the URL:       │  │ Opens the URL:       │
│ familysync...        │  │ familysync...        │
│ vercel.app           │  │ vercel.app           │
│                      │  │                      │
│ Sees shared data     │  │ Sees shared data     │
│ from Supabase        │  │ from Supabase        │
│                      │  │                      │
└──────────────────────┘  └──────────────────────┘
```

---

## Data Flow Example: Caleb Adds a Transaction

```
1. Caleb opens app on his iPhone
   ↓
2. App loads from https://familysync-finance.vercel.app
   ↓
3. JavaScript runs in browser, connects to Supabase using API key
   ↓
4. Caleb enters: "Groceries - $50" and taps Save
   ↓
5. App sends data to Supabase via REST API
   ↓
6. Data is stored in PostgreSQL database
   ↓
7. Data is saved to disk in Supabase's cloud servers
   ↓
8. Rachel refreshes her iPhone
   ↓
9. App queries Supabase for all transactions
   ↓
10. "Groceries - $50" appears in Rachel's Ledger
```

---

## Technology Stack Breakdown

### Frontend (What runs on phones)
- **React** — UI framework (makes interactive screens)
- **TypeScript** — Prevents bugs with type checking
- **Tailwind CSS** — Styling (makes things look nice)
- **Recharts** — Charts/graphs for net worth tracking
- **date-fns** — Date manipulation

### Backend (What stores data)
- **Supabase** — Managed PostgreSQL database
  - Supabase handles: backups, security, scaling, reliability
  - You just use it; don't manage a server

### Hosting (What makes it accessible)
- **Vercel** — Hosts your built app on their servers
  - Builds your code automatically when you push to GitHub
  - Serves it globally with CDN
  - Fast & reliable

### Version Control
- **Git** — Tracks changes to your code
- **GitHub** — Cloud storage + collaboration

---

## Security Notes

### Secrets (Never Share These)
```
VITE_SUPABASE_ANON_KEY = sb_publishable_cuSuPW8er1vo0kwjlMT-2w_0xjoABV9
```
- This key is safe to expose in the browser (it's public/anon)
- Row Level Security policies in Supabase control access
- Don't commit `.env` file to GitHub (it's in `.gitignore`)
- On Vercel, set these as Environment Variables (not in code)

### Your Data
- Stored in **Supabase's servers** (they handle security, encryption, backups)
- Only you and your partner can access it (via URL)
- Not accessible to anyone else without the link

---

## Deployment Environments

### Local Development
- `npm run dev` starts dev server at `http://localhost:5173`
- Hot reload (changes appear instantly)
- Uses `.env` file for Supabase config

### Production (Live)
- Deployed on Vercel
- Uses Environment Variables from Vercel dashboard
- Fully optimized & minified code
- Available 24/7 globally
- Auto-redeployed when you push to GitHub

---

## How to Add New Features Later

1. **Edit code locally**
   ```bash
   cd /home/user/familysync-finance
   # Make changes...
   ```

2. **Test locally**
   ```bash
   npm run dev
   # Open http://localhost:5173
   ```

3. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add new feature"
   git push
   ```

4. **Vercel auto-deploys**
   - Your live URL updates automatically (takes 1-2 min)
   - Both phones see the new version when they refresh

---

## Key Files Explained

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main app component |
| `src/context/AppContext.tsx` | Global state management (user, data) |
| `src/services/mockData.ts` | Supabase API calls & data logic |
| `src/lib/supabase.ts` | Supabase client initialization |
| `src/components/` | React UI components (Ledger, Budgets, etc.) |
| `src/types/index.ts` | TypeScript type definitions |
| `.env` | Environment variables (Supabase credentials) |
| `index.html` | PWA manifest & meta tags |
| `supabase-schema.sql` | Database table creation script |
| `vite.config.ts` | Build configuration |
| `package.json` | Dependencies & scripts |

---

## Scalability

**Current Setup:**
- Supabase free tier can handle millions of queries
- Vercel free tier handles unlimited visitors
- Fast for a couples app

**If you need to scale later:**
- Supabase paid tier: $25+/month
- Vercel Pro: $20/month
- Still very affordable

---

## Disaster Recovery

If something breaks:

1. **Code is backed up on GitHub**
   - All commits are version history
   - Can rollback anytime: `git revert <commit>`

2. **Database is backed up by Supabase**
   - Automatic daily backups
   - Can restore from Supabase dashboard

3. **You can redeploy anytime**
   - Old versions still on Vercel
   - Click "Redeploy" to go back

**Nothing is irreversible!**

---

## Performance Targets

- **App load:** < 2 seconds
- **Database query:** < 200ms
- **Data sync between phones:** Refresh to see changes

(Real-time sync is possible with Supabase subscriptions, but not needed for personal use)
