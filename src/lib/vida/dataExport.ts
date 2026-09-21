import JSZip from 'jszip'
import { supabase } from '@/lib/supabase'
import { VIDA_TABELAS } from '@/lib/vida/tables'

type Registro = Record<string, unknown>

async function buscarTodosOsDados(userId: string): Promise<Record<string, Registro[]>> {
  const resultado: Record<string, Registro[]> = {}
  for (const tabela of VIDA_TABELAS) {
    const { data } = await supabase.from(tabela).select('*').eq('user_id', userId)
    resultado[tabela] = data ?? []
  }
  return resultado
}

function baixarArquivo(conteudo: Blob, nomeArquivo: string) {
  const url = URL.createObjectURL(conteudo)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  link.click()
  URL.revokeObjectURL(url)
}

export async function exportarDadosJson(userId: string) {
  const dados = await buscarTodosOsDados(userId)
  const conteudo = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
  baixarArquivo(conteudo, `miso4life-jornada-${new Date().toISOString().slice(0, 10)}.json`)
}

function paraCsv(linhas: Registro[]): string {
  if (linhas.length === 0) return ''
  const colunas = Object.keys(linhas[0])
  const escapar = (valor: unknown) => {
    const texto = valor == null ? '' : typeof valor === 'object' ? JSON.stringify(valor) : String(valor)
    return `"${texto.replace(/"/g, '""')}"`
  }
  const cabecalho = colunas.map(escapar).join(',')
  const corpo = linhas.map((linha) => colunas.map((coluna) => escapar(linha[coluna])).join(',')).join('\n')
  return `${cabecalho}\n${corpo}`
}

export async function exportarDadosCsv(userId: string) {
  const dados = await buscarTodosOsDados(userId)
  const zip = new JSZip()
  for (const [tabela, linhas] of Object.entries(dados)) {
    if (linhas.length > 0) zip.file(`${tabela}.csv`, paraCsv(linhas))
  }
  const conteudo = await zip.generateAsync({ type: 'blob' })
  baixarArquivo(conteudo, `miso4life-jornada-${new Date().toISOString().slice(0, 10)}.zip`)
}
