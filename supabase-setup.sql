-- Pocket Post — table + RLS for cross-device note sharing.
-- Paste into Supabase Dashboard → SQL Editor and run.

create table if not exists public.pocket_post_notes (
  code            text primary key,
  sender          text not null check (char_length(sender) <= 30),
  recipient       text check (recipient is null or char_length(recipient) <= 30),
  message         text not null check (char_length(message) <= 280),
  stamp_idx       int  not null default 0,
  placed_stickers jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists pocket_post_notes_created_at_idx
  on public.pocket_post_notes (created_at desc);

alter table public.pocket_post_notes enable row level security;

-- Anyone can drop a note in the mailbox
drop policy if exists "anon can insert notes" on public.pocket_post_notes;
create policy "anon can insert notes"
  on public.pocket_post_notes
  for insert
  to anon
  with check (
    char_length(sender)  between 1 and 30
    and char_length(message) between 1 and 280
    and (recipient is null or char_length(recipient) <= 30)
    and stamp_idx between 0 and 50
  );

-- Anyone with the code can pick up a note
drop policy if exists "anon can read notes" on public.pocket_post_notes;
create policy "anon can read notes"
  on public.pocket_post_notes
  for select
  to anon
  using (true);

-- (No update or delete policies — anon cannot modify or delete.)
