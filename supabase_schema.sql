-- Supabase schema de départ
create table public.officers (
 id uuid primary key default gen_random_uuid(),
 badge text unique not null,
 name text not null,
 grade text not null,
 role text,
 status text default 'Actif',
 created_at timestamptz default now()
);
create table public.evaluations (
 id uuid primary key default gen_random_uuid(),
 officer_id uuid references public.officers(id) on delete cascade,
 fto_name text not null,
 module_code text not null,
 score integer check(score between 0 and 100),
 result text not null,
 notes text,
 created_at timestamptz default now()
);
create table public.audit_log (
 id uuid primary key default gen_random_uuid(),
 actor text,
 action text not null,
 details text,
 created_at timestamptz default now()
);
