import { supabase } from '@/lib/supabase'
import { VIDA_TABELAS_ORDEM_EXCLUSAO } from '@/lib/vida/tables'

/**
 * Apaga todos os dados do usuário no módulo Jornada -- tabelas na ordem
 * segura (dependentes primeiro), fotos do Storage e a inscrição de push.
 * Não apaga a conta em si nem outras partes do miso4life fora do módulo.
 */
export async function excluirMeusDados(userId: string) {
  const { data: fotos } = await supabase.from('vida_fotos').select('caminho_storage').eq('user_id', userId)
  if (fotos && fotos.length > 0) {
    await supabase.storage.from('vida-fotos').remove(fotos.map((f) => f.caminho_storage))
  }

  for (const tabela of VIDA_TABELAS_ORDEM_EXCLUSAO) {
    await supabase.from(tabela).delete().eq('user_id', userId)
  }
}
