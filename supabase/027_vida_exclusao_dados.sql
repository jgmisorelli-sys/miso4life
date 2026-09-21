-- O extrato de XP e as conquistas continuam sem policy de "update" (o
-- histórico não pode ser editado), mas passam a permitir "delete" -- é o
-- que torna "excluir meus dados" (LGPD) possível de verdade pelo próprio
-- usuário. Sem isso, essas duas tabelas ficariam presas para sempre.
create policy "vida_xp_ledger_delete_own"
  on public.vida_xp_ledger for delete
  using (auth.uid() = user_id);

create policy "vida_conquistas_delete_own"
  on public.vida_conquistas for delete
  using (auth.uid() = user_id);
