# FamilySync Finance - Redesign Progress

## Completed
- **TypeScript build fix** (commit `6bcaa8f`): Fixed all TS errors blocking Vercel deployment
  - Removed unused imports in `BudgetView.tsx` and `PoolsView.tsx`
  - Fixed Recharts Tooltip formatter type in `BalancesView.tsx`
  - Successfully pushed to GitHub; Vercel auto-redeploy triggered

## In Progress — UI Redesign & New Features

### 1. UI Redesign (Not Yet Started)
Reference: 5 screenshots from a dark-themed finance app analyzed. Key design patterns identified:

- **Dark theme**: Very dark navy/charcoal background throughout
- **Color scheme**: Red/coral for expenses & over-budget, blue for under-budget bars, green for income/deposits
- **Bottom nav**: 4 tabs — Date (e.g. "24/02"), Stats, Accounts, More
- **Budget view**: Horizontal progress bars (blue = under, red = over), category list with budget/used/remaining, Income/Expense toggle tabs
- **Accounts view**: Assets/Liabilities/Total summary row at top, accounts grouped by type (Cash, Bank, Credit Cards), credit cards show Balance Payable + Outstanding Balance columns
- **Transaction form**: Full-screen with Income/Expense/Transfer toggle, fields for Date/Amount/Category/Account/Note, calculator-style numpad at bottom
- **Budget category detail**: Drill-down showing budget/used/remaining, monthly spending bar chart with timeline, transaction list per category
- **Account detail**: Drill-down showing Daily/Monthly/Annually toggle, Deposit/Withdrawal/Total/Balance summary, transactions grouped by date with running balance, orange FAB (+) button

**Files to modify**: All view components, `index.css`, `Header.tsx`, `BottomNav.tsx`, `Modal.tsx`, `MonthPicker.tsx`, `App.tsx`

### 2. Excel Import (Not Yet Started)
- Build a feature to import historical transactions from an Excel spreadsheet
- Will need an xlsx parsing library (e.g. `xlsx` / SheetJS)
- Column mapping UI for matching Excel columns to transaction fields

### 3. User Authentication & Privacy (Not Yet Started)
- Set up accounts with passwords and invite links
- Privacy boundary: husband and wife should only see their own transactions + joint pool
- Currently no auth — uses Supabase anon key with public RLS policies
- Will need: Supabase Auth integration, login/signup flow, invite link generation, RLS policy updates

## Current Codebase Summary

| Area | Files |
|------|-------|
| Types | `src/types/index.ts` |
| State | `src/context/AppContext.tsx` |
| Layout | `src/components/layout/Header.tsx`, `BottomNav.tsx`, `UserSwitcher.tsx` |
| Views | `LedgerView.tsx`, `BudgetView.tsx`, `PoolsView.tsx`, `BalancesView.tsx`, `SettingsView.tsx` |
| Shared | `Modal.tsx`, `MonthPicker.tsx`, `TransactionForm.tsx` |
| Backend | `src/services/mockData.ts`, `src/lib/supabase.ts`, `supabase-schema.sql` |

## Tech Stack
- React 19 + TypeScript 5.9 + Vite 7.3
- Tailwind CSS 4.2
- Recharts 3.7
- Supabase (PostgreSQL + Auth)
- Deployed on Vercel from `calebchchan/familysync-finance` (main branch)
