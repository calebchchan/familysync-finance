# Project File Structure & Explanations

## 📁 Complete Directory Tree

```
familysync-finance/                    ← Your project root folder
│
├── 📄 DEPLOYMENT_GUIDE.md             ← [BEGINNERS] Complete step-by-step guide
├── 📄 QUICK_START.md                  ← [QUICK] 5-minute deployment checklist
├── 📄 ARCHITECTURE.md                 ← [TECH] How everything works together
├── 📄 README_DEPLOYMENT.md            ← [OVERVIEW] You are here
├── 📄 FILE_STRUCTURE.md               ← This file
├── 📄 DEPLOY.md                       ← Original deployment info
│
├── 📄 .env                            ← 🔐 SECRETS (don't share!)
│                                         - VITE_SUPABASE_URL
│                                         - VITE_SUPABASE_ANON_KEY
│
├── 📄 .gitignore                      ← What Git should ignore
│
├── 📄 package.json                    ← Dependencies & npm scripts
│   └─ npm install                     (already done)
│   └─ npm run dev                     (start local server)
│   └─ npm run build                   (create production bundle)
│
├── 📄 package-lock.json               ← Exact dependency versions
│
├── 📄 vite.config.ts                  ← Build configuration
│   └─ Uses Tailwind CSS & React
│
├── 📄 tsconfig.json                   ← TypeScript settings
│
├── 📄 index.html                      ← Main HTML file
│   ├─ PWA manifest link
│   ├─ Theme color
│   └─ Apple mobile web app config
│
├── 📄 supabase-schema.sql             ← 🔑 DATABASE SCHEMA
│   └─ Run this once in Supabase SQL Editor
│   └─ Creates: profiles, categories, accounts, transactions, etc.
│
├── 🗂️ src/                            ← ALL YOUR APP CODE (React)
│   ├── 📄 main.tsx                    ← Entry point
│   ├── 📄 index.css                   ← Global styles (Tailwind)
│   │
│   ├── 📄 App.tsx                     ← Root component
│   │   └─ Shows error state if Supabase not connected
│   │   └─ Shows loading spinner
│   │   └─ Renders active view
│   │
│   ├── 🗂️ context/                    ← Global state management
│   │   └── 📄 AppContext.tsx          ← Redux-like state + API calls
│   │       ├─ Holds: users, transactions, accounts, etc.
│   │       ├─ Methods: addTransaction, updateBudget, etc.
│   │       └─ Error handling for Supabase
│   │
│   ├── 🗂️ types/                      ← TypeScript definitions
│   │   └── 📄 index.ts                ← All type definitions
│   │       ├─ UserProfile, Transaction, Account, etc.
│   │       └─ Makes code safer & autocomplete better
│   │
│   ├── 🗂️ services/                   ← Database & external APIs
│   │   └── 📄 mockData.ts             ← MOST IMPORTANT!
│   │       ├─ Initializes Supabase client
│   │       ├─ Mappers (DB ↔ TypeScript)
│   │       ├─ API object with CRUD operations
│   │       ├─ Auto-seed on first load
│   │       └─ Every app action goes through this
│   │
│   ├── 🗂️ lib/                        ← Utilities & clients
│   │   └── 📄 supabase.ts             ← Supabase client init
│   │       └─ Uses .env variables
│   │
│   ├── 🗂️ components/                 ← React UI Components
│   │   ├── 🗂️ layout/                 ← Navigation & layout
│   │   │   ├── Header.tsx             ← Top bar with logo & user switcher
│   │   │   ├── BottomNav.tsx          ← Tab navigation (5 tabs)
│   │   │   └── UserSwitcher.tsx       ← Caleb ↔ Rachel toggle
│   │   │
│   │   ├── 🗂️ ledger/                 ← Ledger View
│   │   │   └── LedgerView.tsx         ← Monthly summary + transactions
│   │   │       ├─ 4 summary metrics
│   │   │       ├─ Daily grouped list
│   │   │       └─ Month picker
│   │   │
│   │   ├── 🗂️ budget/                 ← Budget View
│   │   │   └── BudgetView.tsx         ← Category budgets + progress bars
│   │   │       ├─ Time-scaling (weekly/monthly/quarterly/yearly)
│   │   │       ├─ Add/edit budget form
│   │   │       └─ Color-coded progress
│   │   │
│   │   ├── 🗂️ pools/                  ← Joint Pools View
│   │   │   └── PoolsView.tsx          ← Shared goals & pledges
│   │   │       ├─ Pool cards with progress
│   │   │       ├─ Pledge mechanism
│   │   │       └─ Detail modal
│   │   │
│   │   ├── 🗂️ balances/               ← Net Worth View
│   │   │   └── BalancesView.tsx       ← Account balances & net worth
│   │   │       ├─ Personal net worth
│   │   │       ├─ Joint value
│   │   │       ├─ Area chart (historical)
│   │   │       └─ Account drill-down
│   │   │
│   │   ├── 🗂️ transactions/           ← Transaction Forms
│   │   │   └── TransactionForm.tsx    ← Add/edit/delete transactions
│   │   │       ├─ Income/Expense/Transfer
│   │   │       ├─ Joint pool selection
│   │   │       └─ Full CRUD
│   │   │
│   │   ├── 🗂️ settings/               ← Settings View
│   │   │   └── SettingsView.tsx       ← Manage all master data
│   │   │       ├─ Edit user names
│   │   │       ├─ Add/edit/delete categories
│   │   │       ├─ Add/edit/delete accounts
│   │   │       ├─ Add/edit/delete pools
│   │   │       ├─ Reset all data button
│   │   │       └─ Data info & reset
│   │   │
│   │   └── 🗂️ shared/                 ← Reusable components
│   │       ├── Modal.tsx              ← Bottom sheet / dialog
│   │       └── MonthPicker.tsx        ← Month navigation control
│   │
│   └── 🗂️ assets/                     ← Images & icons
│       └── react.svg (removed)
│
├── 🗂️ public/                         ← Static files served as-is
│   ├── 📄 manifest.json               ← PWA app manifest
│   │   ├─ App name
│   │   ├─ Icons
│   │   └─ Display mode
│   │
│   └── 📄 icon-192.png                ← App icon (192x192)
│   └── 📄 icon-512.png                ← App icon (512x512)
│
├── 🗂️ dist/                           ← BUILD OUTPUT (after npm run build)
│   ├── index.html                     ← Minified HTML
│   ├── assets/
│   │   ├── index-*.css                ← Minified styles
│   │   └── index-*.js                 ← Minified JavaScript
│   └── manifest.json                  ← PWA manifest
│
├── 🗂️ node_modules/                   ← Dependencies (created by npm install)
│   ├── react/
│   ├── typescript/
│   ├── @supabase/supabase-js/         ← Supabase client library
│   ├── recharts/                      ← Charts library
│   ├── date-fns/                      ← Date utilities
│   └── ... (150+ more packages)
│
└── 🗂️ .git/                           ← Git version control (created after git init)
    └── (Git internal files)
```

---

## 🔑 The Most Important Files

### 1. **supabase-schema.sql**
```
What: Database table definitions
When to use: ONCE at deployment (copy → paste into Supabase SQL Editor)
Why: Creates the structure for storing your data
If you skip: App will show "Database not ready" error
```

### 2. **src/services/mockData.ts**
```
What: All communication with Supabase
Contains:
  - Seed data (sample transactions, accounts, etc.)
  - API object with CRUD methods
  - Auto-seeding on first load
  - Error handling

When modified: Every CRUD operation goes through this
Why important: This is the "brain" of data access
```

### 3. **.env**
```
What: Your Supabase credentials (SECRET!)
Contains:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY

Security:
  - Never commit to Git (it's in .gitignore)
  - Never share with anyone
  - On Vercel: set as Environment Variables instead
```

### 4. **src/context/AppContext.tsx**
```
What: Global state management
Contains:
  - All app state (users, transactions, accounts, etc.)
  - All async data operations
  - Error handling
  - Zustand/Redux-like pattern

When used: Every component can access this data
Why important: Prevents "prop drilling" (passing data through many components)
```

### 5. **index.html**
```
What: Main HTML file served to browsers
Contains:
  - PWA manifest link
  - Apple mobile web app config
  - Favicon
  - Entry point script

Why important: This is what loads first on phones/browsers
Changes: Add meta tags here for PWA features
```

### 6. **src/App.tsx**
```
What: Root React component
Contains:
  - Error boundary (shows error screen if Supabase fails)
  - Loading state
  - View routing (Ledger/Budgets/Pools/Balances/Settings)
  - AppProvider wrapper

When loaded: First React component to render
```

---

## 📊 File Usage by Frequency

### You'll Read These Often
- `src/components/` — UI components
- `QUICK_START.md` — Deployment steps
- `src/services/mockData.ts` — When adding features

### You'll Read These Once
- `supabase-schema.sql` — Database setup (run once)
- `.env` — Already configured
- `DEPLOYMENT_GUIDE.md` — Deployment help

### You'll Rarely Touch These
- `vite.config.ts` — Build config (already good)
- `tsconfig.json` — TypeScript config (already good)
- `package.json` — Dependencies (already configured)

---

## 🔄 Data Flow Through Files

```
User opens app
    ↓
Browser loads index.html
    ↓
React renders App.tsx
    ↓
App.tsx shows AppProvider wrapper
    ↓
AppContext.tsx initializes
    ↓
AppContext calls api.getUsers() from mockData.ts
    ↓
mockData.ts connects to Supabase
    ↓
Supabase returns data (auto-seeds if first load)
    ↓
AppContext stores in useState
    ↓
Components read from AppContext via useApp()
    ↓
User sees Ledger/Budgets/Pools/Balances/Settings
    ↓
User clicks button → component calls api method
    ↓
mockData.ts updates Supabase
    ↓
AppContext updates state
    ↓
Components re-render with new data
```

---

## 📦 Dependencies (What Each Package Does)

### React Ecosystem
- `react` — UI framework
- `react-dom` — React rendering for web
- `typescript` — Type safety

### Styling
- `tailwindcss` — CSS framework (utility-first)
- `@tailwindcss/vite` — Tailwind for Vite

### Data & Time
- `@supabase/supabase-js` — Supabase client
- `date-fns` — Date manipulation
- `uuid` — Generate unique IDs

### Charting
- `recharts` — Beautiful charts/graphs

### Build Tools
- `vite` — Fast build tool
- `@vitejs/plugin-react` — React plugin for Vite

---

## 🛠️ How to Find Things

| Looking for... | Location | File |
|---|---|---|
| **How to add a transaction** | src/components/transactions/ | TransactionForm.tsx |
| **Where transactions are stored** | Supabase database | supabase-schema.sql |
| **How to get transactions** | src/services/ | mockData.ts |
| **App state management** | src/context/ | AppContext.tsx |
| **Type definitions** | src/types/ | index.ts |
| **Ledger view code** | src/components/ledger/ | LedgerView.tsx |
| **Budget view code** | src/components/budget/ | BudgetView.tsx |
| **Deployment instructions** | Project root | DEPLOYMENT_GUIDE.md |
| **Database setup** | Project root | supabase-schema.sql |

---

## 🚀 After You Deploy

### Files You'll Push to GitHub
```
Everything EXCEPT:
  ❌ node_modules/ (ignored via .gitignore)
  ❌ dist/ (ignored via .gitignore)
  ❌ .env (ignored via .gitignore — secrets never pushed!)
```

### Files Created on Vercel
```
dist/
  ├── index.html (minified)
  ├── assets/index-*.css (minified styles)
  └── assets/index-*.js (minified JavaScript)
```

### Files in Supabase
```
PostgreSQL Database:
  ├── profiles (users)
  ├── categories (spending categories)
  ├── accounts (bank accounts, credit cards)
  ├── transactions (income/expense/transfer)
  ├── joint_pools (shared goals)
  ├── pledges (commitments to pools)
  ├── budgets (spending limits)
  └── account_groups (account organization)
```

---

## ✅ Checklist: Do These Files Exist?

- [ ] `/home/user/familysync-finance/supabase-schema.sql` ← Run this first!
- [ ] `/home/user/familysync-finance/.env` ← Has Supabase credentials
- [ ] `/home/user/familysync-finance/src/` ← App code folder
- [ ] `/home/user/familysync-finance/public/` ← Images & manifest
- [ ] `/home/user/familysync-finance/package.json` ← Dependencies
- [ ] `/home/user/familysync-finance/QUICK_START.md` ← Your cheatsheet

If all ✓, you're ready to deploy!

---

## 🎯 Next Steps

1. **Read:** `QUICK_START.md` (5 minutes)
2. **Follow:** The steps in order
3. **Test:** Open the live URL on both iPhones
4. **Enjoy:** Managing finances together!

Questions? I'm here to help! 🚀
