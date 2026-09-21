/** Todas as tabelas do módulo Jornada, usadas pela exportação e pela exclusão de dados. */
export const VIDA_TABELAS = [
  'vida_perfil',
  'vida_fases',
  'vida_sprints',
  'vida_missoes_config',
  'vida_registro_dia',
  'vida_alimentos_catalogo',
  'vida_refeicoes',
  'vida_refeicoes_itens',
  'vida_treinos_plano',
  'vida_treinos_exercicios',
  'vida_treinos_feitos',
  'vida_exercicios_catalogo',
  'vida_medidas',
  'vida_fotos',
  'vida_eventos_sociais',
  'vida_missoes_feitas',
  'vida_xp_ledger',
  'vida_streak',
  'vida_recompensas_config',
  'vida_recompensas',
  'vida_desejos',
  'vida_conquistas',
  'vida_lembretes_config',
  'vida_familia_participantes',
  'vida_push_subscriptions',
] as const

export type VidaTabela = (typeof VIDA_TABELAS)[number]

/**
 * Ordem segura para excluir (tabelas dependentes antes das que elas
 * referenciam), pra não esbarrar em chaves estrangeiras sem ON DELETE
 * CASCADE/SET NULL.
 */
export const VIDA_TABELAS_ORDEM_EXCLUSAO: VidaTabela[] = [
  'vida_refeicoes_itens',
  'vida_treinos_exercicios',
  'vida_treinos_feitos',
  'vida_exercicios_catalogo',
  'vida_refeicoes',
  'vida_alimentos_catalogo',
  'vida_treinos_plano',
  'vida_sprints',
  'vida_fases',
  'vida_missoes_feitas',
  'vida_xp_ledger',
  'vida_streak',
  'vida_recompensas',
  'vida_recompensas_config',
  'vida_desejos',
  'vida_conquistas',
  'vida_eventos_sociais',
  'vida_medidas',
  'vida_fotos',
  'vida_registro_dia',
  'vida_missoes_config',
  'vida_lembretes_config',
  'vida_familia_participantes',
  'vida_push_subscriptions',
  'vida_perfil',
]
