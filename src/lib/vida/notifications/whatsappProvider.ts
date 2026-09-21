export interface WhatsappMensagem {
  telefone: string
  corpo: string
}

export interface WhatsappResultadoEnvio {
  enviado: boolean
  erro?: string
}

/** Interface de canal que qualquer provedor de WhatsApp deve implementar. */
export interface WhatsappProvider {
  nome: string
  enviar(mensagem: WhatsappMensagem): Promise<WhatsappResultadoEnvio>
}

/**
 * Nenhum provedor está configurado ainda -- aguardando decisão do usuário
 * entre WhatsApp Cloud API, Evolution API ou Z-API (ver tela Configurações
 * e o README do módulo). Esta implementação existe só pra deixar a
 * interface pronta; nunca deve ser chamada para envio real.
 */
export class WhatsappProviderNaoConfigurado implements WhatsappProvider {
  nome = 'nao_configurado'

  async enviar(): Promise<WhatsappResultadoEnvio> {
    return { enviado: false, erro: 'Nenhum provedor de WhatsApp configurado ainda.' }
  }
}

export function obterProvedorWhatsapp(): WhatsappProvider {
  return new WhatsappProviderNaoConfigurado()
}
