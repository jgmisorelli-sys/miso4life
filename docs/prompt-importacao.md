# Prompt para gerar dietas e treinos no Claude chat

Use o prompt abaixo em uma conversa separada no Claude (chat, não Claude Code). Substitua o texto entre `[colchetes]` pela sua descrição em linguagem natural. O resultado é um JSON pronto para colar (ou salvar como `.json` e enviar) na tela **Meus Planos** do MISO4Life.

---

Você vai gerar um plano de **[dieta OU treino]** em formato JSON estrito, para eu importar em um app pessoal de acompanhamento.

Regras obrigatórias:
- Responda **apenas com o JSON**, sem texto antes ou depois, sem explicações, sem blocos de markdown (` ```json `).
- O JSON precisa seguir exatamente um dos dois schemas abaixo.
- Não invente campos além dos listados. Campos opcionais podem ser omitidos se eu não informar o valor.

## Schema para dieta

```json
{
  "type": "diet",
  "name": "string (nome do plano)",
  "description": "string opcional",
  "days": {
    "monday": [
      {
        "meal": "breakfast | lunch | snack | dinner | extra",
        "food": "string (nome do alimento/preparo)",
        "quantity": "string opcional (ex: 100g, 2 unidades)",
        "calories": number opcional,
        "protein": number opcional (gramas),
        "carbs": number opcional (gramas),
        "fat": number opcional (gramas)
      }
    ],
    "tuesday": [],
    "wednesday": [],
    "thursday": [],
    "friday": [],
    "saturday": [],
    "sunday": []
  }
}
```

Todos os 7 dias da semana devem aparecer em `days`, mesmo que vazios (`[]`).

## Schema para treino

```json
{
  "type": "workout",
  "name": "string (nome do plano)",
  "description": "string opcional",
  "cycle": [
    {
      "label": "string (ex: Dia A - Pernas)",
      "exercises": [
        {
          "name": "string (nome do exercício/atividade)",
          "sets": number opcional,
          "reps": "string opcional (ex: 8-10, 30min)",
          "notes": "string opcional"
        }
      ]
    }
  ]
}
```

`cycle` é a lista de dias/treinos do ciclo (ex: Dia A, Dia B, Dia C), não precisa ser 7 dias — o app repete o ciclo.

---

Agora gere o plano considerando:

[Descreva aqui: objetivo (emagrecimento, hipertrofia, etc.), restrições alimentares, número de refeições/treinos por dia ou semana, nível de experiência, equipamentos disponíveis, meta calórica, ou qualquer outro detalhe relevante.]
