-- =====================================================================
-- ADMIN ÚNICO — Davidson (pensericodigital@gmail.com)
-- Registra o admin por E-MAIL (funciona antes mesmo de ele ter conta;
-- a partir do momento que logar com esse e-mail, é reconhecido como admin).
-- Rode isto no Supabase → SQL Editor (cole tudo e "Run"), ou via CLI.
-- =====================================================================

-- 1) Tabela de admins (fonte da verdade). Trancada: só o service_role mexe.
create table if not exists public.admins (
  email      text primary key,
  nome       text,
  created_at timestamptz not null default now()
);

insert into public.admins (email, nome)
values ('pensericodigital@gmail.com', 'Davidson')
on conflict (email) do update set nome = excluded.nome;

alter table public.admins enable row level security;
-- Sem nenhuma policy de SELECT/INSERT/UPDATE/DELETE para o público:
-- por padrão o RLS NEGA tudo pelo cliente. Só o backend (service_role) enxerga.

-- 2) Função is_admin(): diz se o usuário logado AGORA é admin.
--    Usa o e-mail que vem no token da sessão (confiável, validado pelo Supabase).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins a
    where a.email = (auth.jwt() ->> 'email')
  );
$$;

-- 3) Exemplo de como uma futura tabela de admin fica protegida:
--    (não cria nada agora — é só o padrão a usar quando montarmos o painel)
--    create policy "admin gerencia X" on public.<tabela>
--      for all to authenticated
--      using ( public.is_admin() ) with check ( public.is_admin() );

-- Pronto: pensericodigital@gmail.com é o ÚNICO admin.
-- Para adicionar/remover admins depois: mexer na tabela public.admins.
