export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'extra'
export type WorkoutType = 'strength' | 'aerobic'
export type CoffeeUnit = 'cups' | 'ml'

// Módulo Jornada (Plano 60 Dias) — tipos auxiliares
export type VidaFaseStatus = 'planejada' | 'ativa' | 'concluida'
export type VidaMissaoTipo = 'diaria' | 'semanal'
export type VidaMedidaTipo = 'peso' | 'cintura' | 'bioimpedancia' | 'condicionamento'
export type VidaFotoAngulo = 'frente' | 'lado' | 'costas'
export type VidaRefeicaoTipo = 'cafe' | 'almoco' | 'lanche' | 'jantar'
export type VidaAlimentoCategoria = 'proteina' | 'carboidrato' | 'gordura' | 'vegetal' | 'outro'
export type VidaDiaSemana =
  | 'segunda'
  | 'terca'
  | 'quarta'
  | 'quinta'
  | 'sexta'
  | 'sabado'
  | 'domingo'
export type VidaRecompensaEstado = 'bloqueada' | 'disponivel' | 'resgatada'
export type VidaLembreteTipo =
  | 'manha'
  | 'janela_treino'
  | 'fechamento_dia'
  | 'resumo_semana'
  | 'pre_bioimpedancia'
export type VidaLembreteCanal = 'push' | 'whatsapp'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          target_weight_kg: number | null
          daily_calorie_goal: number | null
          daily_water_ml_goal: number
          glass_size_ml: number
          daily_coffee_limit: number
          coffee_unit: CoffeeUnit
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
        Relationships: []
      }
      body_logs: {
        Row: {
          id: string
          user_id: string
          weight_kg: number
          body_fat_pct: number | null
          waist_cm: number | null
          hip_cm: number | null
          logged_at: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['body_logs']['Row']> & {
          user_id: string
          weight_kg: number
        }
        Update: Partial<Database['public']['Tables']['body_logs']['Row']>
        Relationships: []
      }
      food_logs: {
        Row: {
          id: string
          user_id: string
          meal_type: MealType
          food_name: string
          quantity: string | null
          calories: number | null
          protein_g: number | null
          carbs_g: number | null
          fat_g: number | null
          logged_at: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['food_logs']['Row']> & {
          user_id: string
          meal_type: MealType
          food_name: string
        }
        Update: Partial<Database['public']['Tables']['food_logs']['Row']>
        Relationships: []
      }
      water_logs: {
        Row: {
          id: string
          user_id: string
          amount_ml: number
          logged_at: string
        }
        Insert: Partial<Database['public']['Tables']['water_logs']['Row']> & {
          user_id: string
          amount_ml: number
        }
        Update: Partial<Database['public']['Tables']['water_logs']['Row']>
        Relationships: []
      }
      coffee_logs: {
        Row: {
          id: string
          user_id: string
          amount: number
          unit: CoffeeUnit
          logged_at: string
        }
        Insert: Partial<Database['public']['Tables']['coffee_logs']['Row']> & {
          user_id: string
          amount: number
        }
        Update: Partial<Database['public']['Tables']['coffee_logs']['Row']>
        Relationships: []
      }
      workout_logs: {
        Row: {
          id: string
          user_id: string
          workout_type: WorkoutType
          exercise_name: string
          sets: number | null
          reps: string | null
          weight_kg: number | null
          duration_min: number | null
          distance_km: number | null
          calories: number | null
          logged_at: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['workout_logs']['Row']> & {
          user_id: string
          workout_type: WorkoutType
          exercise_name: string
        }
        Update: Partial<Database['public']['Tables']['workout_logs']['Row']>
        Relationships: []
      }
      diet_plans: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['diet_plans']['Row']> & {
          user_id: string
          name: string
        }
        Update: Partial<Database['public']['Tables']['diet_plans']['Row']>
        Relationships: []
      }
      diet_plan_items: {
        Row: {
          id: string
          diet_plan_id: string
          day_of_week: DayOfWeek
          meal_type: MealType
          food_name: string
          quantity: string | null
          calories: number | null
          protein_g: number | null
          carbs_g: number | null
          fat_g: number | null
          order_index: number
        }
        Insert: Partial<Database['public']['Tables']['diet_plan_items']['Row']> & {
          diet_plan_id: string
          day_of_week: DayOfWeek
          meal_type: MealType
          food_name: string
        }
        Update: Partial<Database['public']['Tables']['diet_plan_items']['Row']>
        Relationships: []
      }
      workout_plans: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['workout_plans']['Row']> & {
          user_id: string
          name: string
        }
        Update: Partial<Database['public']['Tables']['workout_plans']['Row']>
        Relationships: []
      }
      workout_plan_days: {
        Row: {
          id: string
          workout_plan_id: string
          label: string
          order_index: number
        }
        Insert: Partial<Database['public']['Tables']['workout_plan_days']['Row']> & {
          workout_plan_id: string
          label: string
        }
        Update: Partial<Database['public']['Tables']['workout_plan_days']['Row']>
        Relationships: []
      }
      workout_plan_exercises: {
        Row: {
          id: string
          workout_plan_day_id: string
          name: string
          sets: number | null
          reps: string | null
          notes: string | null
          order_index: number
        }
        Insert: Partial<Database['public']['Tables']['workout_plan_exercises']['Row']> & {
          workout_plan_day_id: string
          name: string
        }
        Update: Partial<Database['public']['Tables']['workout_plan_exercises']['Row']>
        Relationships: []
      }

      // Módulo Jornada (Plano 60 Dias)
      vida_perfil: {
        Row: {
          user_id: string
          altura_cm: number | null
          data_nascimento: string | null
          data_inicio_plano: string
          fuso_horario: string
          aceitou_aviso_saude: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_perfil']['Row']> & {
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['vida_perfil']['Row']>
        Relationships: []
      }
      vida_fases: {
        Row: {
          id: string
          user_id: string
          numero: number
          nome: string
          meta_percentual_gordura: number | null
          peso_estimado_kg: number | null
          prazo_dias: number
          status: VidaFaseStatus
          data_inicio: string | null
          data_fim: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_fases']['Row']> & {
          user_id: string
          numero: number
          nome: string
          prazo_dias: number
        }
        Update: Partial<Database['public']['Tables']['vida_fases']['Row']>
        Relationships: []
      }
      vida_sprints: {
        Row: {
          id: string
          user_id: string
          fase_id: string
          numero: number
          tema: string
          foco_missao_codigo: string | null
          data_inicio: string
          data_fim: string
          meta_xp: number
          status: VidaFaseStatus
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_sprints']['Row']> & {
          user_id: string
          fase_id: string
          numero: number
          tema: string
          data_inicio: string
          data_fim: string
        }
        Update: Partial<Database['public']['Tables']['vida_sprints']['Row']>
        Relationships: []
      }
      vida_missoes_config: {
        Row: {
          id: string
          user_id: string
          codigo: string
          nome: string
          tipo: VidaMissaoTipo
          xp: number
          xp_semana_pesada: number | null
          ativa: boolean
          ordem: number
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_missoes_config']['Row']> & {
          user_id: string
          codigo: string
          nome: string
          tipo: VidaMissaoTipo
          xp: number
        }
        Update: Partial<Database['public']['Tables']['vida_missoes_config']['Row']>
        Relationships: []
      }
      vida_registro_dia: {
        Row: {
          id: string
          user_id: string
          data: string
          semana_pesada: boolean
          passos: number | null
          sono_horas: number | null
          hora_dormir: string | null
          energia: number | null
          conforto_digestivo: number | null
          observacao: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_registro_dia']['Row']> & {
          user_id: string
          data: string
        }
        Update: Partial<Database['public']['Tables']['vida_registro_dia']['Row']>
        Relationships: []
      }
      vida_alimentos_catalogo: {
        Row: {
          id: string
          user_id: string
          nome: string
          categoria: VidaAlimentoCategoria
          porcao_label: string
          kcal_por_porcao: number
          proteina_g_por_porcao: number | null
          carboidrato_g_por_porcao: number | null
          gordura_g_por_porcao: number | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_alimentos_catalogo']['Row']> & {
          user_id: string
          nome: string
          categoria: VidaAlimentoCategoria
        }
        Update: Partial<Database['public']['Tables']['vida_alimentos_catalogo']['Row']>
        Relationships: []
      }
      vida_refeicoes: {
        Row: {
          id: string
          user_id: string
          data: string
          tipo_refeicao: VidaRefeicaoTipo
          proteina_ok: boolean
          prato_ok: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_refeicoes']['Row']> & {
          user_id: string
          data: string
          tipo_refeicao: VidaRefeicaoTipo
        }
        Update: Partial<Database['public']['Tables']['vida_refeicoes']['Row']>
        Relationships: []
      }
      vida_refeicoes_itens: {
        Row: {
          id: string
          user_id: string
          refeicao_id: string
          alimento_id: string
          porcoes: number
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_refeicoes_itens']['Row']> & {
          user_id: string
          refeicao_id: string
          alimento_id: string
        }
        Update: Partial<Database['public']['Tables']['vida_refeicoes_itens']['Row']>
        Relationships: []
      }
      vida_treinos_plano: {
        Row: {
          id: string
          user_id: string
          dia_semana: VidaDiaSemana
          nome_sessao: string
          duracao_min_estimado: number | null
          fixo: boolean
          ordem: number
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_treinos_plano']['Row']> & {
          user_id: string
          dia_semana: VidaDiaSemana
          nome_sessao: string
        }
        Update: Partial<Database['public']['Tables']['vida_treinos_plano']['Row']>
        Relationships: []
      }
      vida_treinos_exercicios: {
        Row: {
          id: string
          user_id: string
          sessao_id: string
          nome_exercicio: string
          series: number | null
          repeticoes: string | null
          observacao: string | null
          ordem: number
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_treinos_exercicios']['Row']> & {
          user_id: string
          sessao_id: string
          nome_exercicio: string
        }
        Update: Partial<Database['public']['Tables']['vida_treinos_exercicios']['Row']>
        Relationships: []
      }
      vida_treinos_feitos: {
        Row: {
          id: string
          user_id: string
          data: string
          sessao_id: string | null
          duracao_real_min: number | null
          observacao: string | null
          versao_minima: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_treinos_feitos']['Row']> & {
          user_id: string
          data: string
        }
        Update: Partial<Database['public']['Tables']['vida_treinos_feitos']['Row']>
        Relationships: []
      }
      vida_medidas: {
        Row: {
          id: string
          user_id: string
          data: string
          tipo: VidaMedidaTipo
          valores: Record<string, number | string | null>
          observacao: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_medidas']['Row']> & {
          user_id: string
          data: string
          tipo: VidaMedidaTipo
        }
        Update: Partial<Database['public']['Tables']['vida_medidas']['Row']>
        Relationships: []
      }
      vida_fotos: {
        Row: {
          id: string
          user_id: string
          data: string
          angulo: VidaFotoAngulo
          caminho_storage: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_fotos']['Row']> & {
          user_id: string
          data: string
          angulo: VidaFotoAngulo
          caminho_storage: string
        }
        Update: Partial<Database['public']['Tables']['vida_fotos']['Row']>
        Relationships: []
      }
      vida_eventos_sociais: {
        Row: {
          id: string
          user_id: string
          data: string
          descricao: string | null
          cumprido: boolean | null
          xp_concedido: number
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_eventos_sociais']['Row']> & {
          user_id: string
          data: string
        }
        Update: Partial<Database['public']['Tables']['vida_eventos_sociais']['Row']>
        Relationships: []
      }
      vida_missoes_feitas: {
        Row: {
          id: string
          user_id: string
          data: string
          missao_codigo: string
          xp_concedido: number
          origem: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_missoes_feitas']['Row']> & {
          user_id: string
          data: string
          missao_codigo: string
          xp_concedido: number
        }
        Update: Partial<Database['public']['Tables']['vida_missoes_feitas']['Row']>
        Relationships: []
      }
      vida_xp_ledger: {
        Row: {
          id: string
          user_id: string
          data: string
          xp: number
          motivo: string
          referencia_tipo: string | null
          referencia_id: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_xp_ledger']['Row']> & {
          user_id: string
          data: string
          xp: number
          motivo: string
        }
        Update: never
        Relationships: []
      }
      vida_streak: {
        Row: {
          user_id: string
          sequencia_atual: number
          recorde: number
          dias_sem_falhar_duas_seguidas: number
          escudos_disponiveis: number
          escudos_mes_referencia: string
          ultima_data_avaliada: string | null
          dia_anterior_falhou: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_streak']['Row']> & {
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['vida_streak']['Row']>
        Relationships: []
      }
      vida_recompensas_config: {
        Row: {
          id: string
          user_id: string
          gatilho: string
          nome: string
          valor: number
          regra: Record<string, unknown>
          ativa: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_recompensas_config']['Row']> & {
          user_id: string
          gatilho: string
          nome: string
        }
        Update: Partial<Database['public']['Tables']['vida_recompensas_config']['Row']>
        Relationships: []
      }
      vida_recompensas: {
        Row: {
          id: string
          user_id: string
          recompensa_config_id: string | null
          referencia_tipo: string | null
          referencia_id: string | null
          estado: VidaRecompensaEstado
          valor: number | null
          desejo_id: string | null
          data_conquista: string | null
          data_resgate: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_recompensas']['Row']> & {
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['vida_recompensas']['Row']>
        Relationships: []
      }
      vida_desejos: {
        Row: {
          id: string
          user_id: string
          nome: string
          valor_estimado: number | null
          link: string | null
          prioridade: number
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_desejos']['Row']> & {
          user_id: string
          nome: string
        }
        Update: Partial<Database['public']['Tables']['vida_desejos']['Row']>
        Relationships: []
      }
      vida_conquistas: {
        Row: {
          id: string
          user_id: string
          codigo: string
          nome: string
          data_conquista: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_conquistas']['Row']> & {
          user_id: string
          codigo: string
          nome: string
        }
        Update: never
        Relationships: []
      }
      vida_lembretes_config: {
        Row: {
          id: string
          user_id: string
          tipo: VidaLembreteTipo
          horario: string | null
          canal: VidaLembreteCanal
          ativo: boolean
          mensagem: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_lembretes_config']['Row']> & {
          user_id: string
          tipo: VidaLembreteTipo
        }
        Update: Partial<Database['public']['Tables']['vida_lembretes_config']['Row']>
        Relationships: []
      }
      vida_push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_push_subscriptions']['Row']> & {
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
        }
        Update: Partial<Database['public']['Tables']['vida_push_subscriptions']['Row']>
        Relationships: []
      }
      vida_familia_participantes: {
        Row: {
          id: string
          user_id: string
          nome: string
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['vida_familia_participantes']['Row']> & {
          user_id: string
          nome: string
        }
        Update: Partial<Database['public']['Tables']['vida_familia_participantes']['Row']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
