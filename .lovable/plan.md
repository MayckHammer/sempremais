

# 📱 Mi Rebok - App de Guincho e Assistência 24h

## 🎨 Design & Identidade Visual
- Cores principais baseadas na logo: **laranja (#f97316)** e **cinza escuro (#4a4a4a)**
- Fundo escuro (slate-900) com detalhes em laranja
- Design moderno e limpo, otimizado para mobile
- Logo oficial do Mi Rebok no cabeçalho

---

## 🚀 FASE 1 - MVP (Implementação Inicial)

### 1. Sistema de Autenticação
- **Área do Cliente**: Cadastro e login para solicitar serviços
- **Área do Prestador**: Cadastro e login separado para receber solicitações
- Verificação de email para segurança

### 2. Tela do Cliente
- Detecção automática de localização por GPS
- Seleção de serviços disponíveis:
  - 🚗 Reboque
  - 🔑 Auxílio Chaveiro
  - 🛞 Auxílio Borracheiro
  - 🔄 Destombamento
  - 📦 Frete (pequeno e grande)
- Formulário de solicitação com dados do veículo e descrição do problema
- Lista de prestadores próximos ordenados por ranking e avaliação
- Histórico de solicitações do cliente

### 3. Tela do Prestador
- Visualização de solicitações disponíveis na região
- Botões para aceitar ou recusar serviços
- Painel com estatísticas pessoais:
  - Total de serviços realizados
  - Taxa de aceitação
  - Avaliação média
  - Ranking atual
- Gerenciamento de atendimentos em andamento

### 4. Sistema de Ranking Inteligente
- Prestadores com maior taxa de aceitação aparecem primeiro
- Prestadores mais ágeis (que respondem rápido) ganham prioridade
- Sistema de avaliação por estrelas (1-5) pelos clientes
- O ranking é calculado automaticamente considerando todos esses fatores

### 5. Fluxo de Atendimento
- Cliente solicita → Prestadores próximos são notificados
- Prestador aceita → Cliente é informado
- Prestador conclui → Cliente pode avaliar
- Avaliação impacta o ranking do prestador

---

## 📈 FASE 2 - Recursos Adicionais (Próxima Etapa)

### Pagamentos Integrados (Stripe)
- Pagamento via PIX, cartão de crédito/débito
- Orçamento prévio antes da confirmação
- Histórico de transações

### Painel Administrativo
- Dashboard com métricas do negócio
- Gestão de prestadores (aprovação, bloqueio)
- Relatórios de solicitações e faturamento
- Visualização de avaliações e reclamações

### Notificações Push
- Alertas em tempo real para prestadores sobre novas solicitações
- Atualizações de status para clientes

---

## 🛠️ Tecnologias Necessárias

- **Frontend**: React + Tailwind CSS (design responsivo)
- **Backend**: Lovable Cloud com Supabase (banco de dados, autenticação)
- **Pagamentos**: Stripe (na Fase 2)
- **Mapas/Localização**: Geolocalização nativa do navegador

