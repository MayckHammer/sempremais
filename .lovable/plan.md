

# Reorganizar Configurações IA em Duas Sub-abas

## Resumo

Transformar a página de configurações em um layout de dois níveis: primeiro o usuário escolhe entre **"Agente IA"** e **"Classificação de Urgência"**, e dentro de cada uma aparecem as sub-abas específicas. A aba "Urgência" sai do menu lateral atual e vira uma seção independente no mesmo nível que "Configurar Agente IA".

## Estrutura Visual

```text
┌─────────────────────────────────────────────────┐
│  [🤖 Agente IA]    [⚡ Classificação Urgência]  │  ← seletor principal (top-level)
├─────────────────────────────────────────────────┤
│                                                 │
│  Se "Agente IA" selecionado:                    │
│  ┌──────────────┐ ┌──────────────────────────┐  │
│  │ Personalidade│ │                          │  │
│  │ Escalação    │ │   Conteúdo da sub-aba    │  │
│  │ Regras       │ │                          │  │
│  │ Modelo IA    │ │                          │  │
│  └──────────────┘ └──────────────────────────┘  │
│                                                 │
│  Se "Classificação Urgência" selecionado:       │
│  ┌──────────────┐ ┌──────────────────────────┐  │
│  │ Configuração │ │                          │  │
│  │ Regras       │ │   Conteúdo da sub-aba    │  │
│  │ Modelo IA    │ │                          │  │
│  └──────────────┘ └──────────────────────────┘  │
│                                                 │
│  [             Salvar Configurações            ]│
└─────────────────────────────────────────────────┘
```

## Etapas

### 1. Criar seletor principal de seção (top-level)

Acima do layout atual, adicionar dois cards/botões clicáveis lado a lado:
- **Agente IA** (ícone Bot) — "Personalidade, regras e modelo do assistente"
- **Classificação de Urgência** (ícone AlertTriangle) — "Modelo, prompt e regras de classificação"

Usar o mesmo estilo visual do header atual (gradient card), com estado ativo destacado. O header muda título/descrição conforme a seção selecionada.

### 2. Reorganizar sub-abas do Agente IA

Remover "Urgência" do array TABS atual. Manter apenas:
- Personalidade, Escalação, Regras, Modelo IA

### 3. Criar sub-abas da Classificação de Urgência

Novo array de sub-abas:
- **Configuração** — switches (ativar/desativar, night boost), fallback urgency
- **Regras** — prompt de classificação + critérios (textareas)
- **Modelo IA** — ModelSelector para urgency

Reutiliza os mesmos componentes (ModelSelector, Switch, Textarea, Labels) e mesmo padrão visual de cards/spacing.

### 4. Manter lógica de save unificada

O botão "Salvar Configurações" continua salvando ambas as configs (agent_config + urgency_config) independente da seção ativa.

## Arquivo Afetado

- `src/pages/admin/AdminSettings.tsx` — única alteração necessária

