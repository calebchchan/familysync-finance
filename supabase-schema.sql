-- ============================================================
-- FamilySync Finance — Supabase Schema
-- Run this entire file in:
--   Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- Profiles (husband / wife personas)
create table if not exists profiles (
  id      text primary key,
  name    text not null,
  avatar  text not null
);

-- Categories
create table if not exists categories (
  id    text primary key,
  name  text not null,
  icon  text not null,
  type  text not null check (type in ('income', 'expense'))
);

-- Account Groups
create table if not exists account_groups (
  id          text primary key,
  name        text not null,
  sort_order  integer not null default 0
);

-- Accounts (bank, credit card, wallet)
create table if not exists accounts (
  id        text primary key,
  user_id   text not null,
  name      text not null,
  group_id  text,
  balance   numeric not null default 0,
  icon      text not null
);

-- Joint Pools
create table if not exists joint_pools (
  id          text primary key,
  name        text not null,
  target      numeric not null default 0,
  icon        text not null,
  sort_order  integer not null default 0
);

-- Pledges (commitments to a pool)
create table if not exists pledges (
  id                text primary key,
  user_id           text not null,
  pool_id           text,
  amount            numeric not null,
  date              text not null,
  recurring         boolean,
  recurring_period  text
);

-- Budgets
create table if not exists budgets (
  id            text primary key,
  user_id       text not null,
  category_id   text,
  budget_limit  numeric not null,
  period        text not null
);

-- Transactions
create table if not exists transactions (
  id            text primary key,
  user_id       text not null,
  type          text not null check (type in ('income', 'expense', 'transfer')),
  amount        numeric not null,
  description   text not null,
  category_id   text,
  account_id    text,
  to_account_id text,
  pool_id       text,
  date          text not null,
  created_at    text not null
);

-- ── Row Level Security ──────────────────────────────────
-- Enable RLS on every table
alter table profiles       enable row level security;
alter table categories     enable row level security;
alter table account_groups enable row level security;
alter table accounts       enable row level security;
alter table joint_pools    enable row level security;
alter table pledges        enable row level security;
alter table budgets        enable row level security;
alter table transactions   enable row level security;

-- Allow full public (anon) access — no auth needed for this app.
-- Drop first in case you're re-running after a partial setup.
drop policy if exists "public_all" on profiles;
drop policy if exists "public_all" on categories;
drop policy if exists "public_all" on account_groups;
drop policy if exists "public_all" on accounts;
drop policy if exists "public_all" on joint_pools;
drop policy if exists "public_all" on pledges;
drop policy if exists "public_all" on budgets;
drop policy if exists "public_all" on transactions;

create policy "public_all" on profiles       for all to anon using (true) with check (true);
create policy "public_all" on categories     for all to anon using (true) with check (true);
create policy "public_all" on account_groups for all to anon using (true) with check (true);
create policy "public_all" on accounts       for all to anon using (true) with check (true);
create policy "public_all" on joint_pools    for all to anon using (true) with check (true);
create policy "public_all" on pledges        for all to anon using (true) with check (true);
create policy "public_all" on budgets        for all to anon using (true) with check (true);
create policy "public_all" on transactions   for all to anon using (true) with check (true);

-- ── Done! ────────────────────────────────────────────────
-- The app will auto-seed sample data on first load.
