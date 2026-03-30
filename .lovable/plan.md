

# Redesign Premium do Chat Window

## Problema
A janela de chat atual tem visual genérico e plano — fundo branco liso, bordas simples, bolhas de mensagem sem personalidade. Parece um widget de suporte padrão gerado por template.

## Solução

### Editar `src/components/SupportChatWindow.tsx`

**Header reinventado:**
- Gradiente sutil no header (`bg-gradient-to-r from-card via-card to-primary/5`) com `backdrop-blur`
- Avatar do agente com ring animado pulsante (indicador "online") em vez de ícone Bot solto
- Status badge com dot animado à esquerda do texto
- Botão de fechar com hover suave em vez de ghost genérico

**Área de mensagens:**
- Fundo com noise texture sutil (`bg-[url] opacity-[0.02]`) ou gradiente radial muito suave para dar profundidade
- Bolhas do cliente: gradiente primário com borda glow sutil (`shadow-[0_2px_12px_hsl(var(--primary)/0.2)]`), cantos assimétricos (`rounded-2xl rounded-br-md`)
- Bolhas do agente: glassmorphism (`bg-white/5 backdrop-blur-sm border border-white/10`), cantos assimétricos (`rounded-2xl rounded-bl-md`)
- Bolhas do atendente humano: borda dourada sutil com ícone diferenciado
- Avatares com gradiente mesh em vez de fundo cinza plano
- Timestamps integrados na bolha de forma mais orgânica (inline no rodapé)
- Animação de entrada nas mensagens com `framer-motion` (fade-in + slide sutil)

**Indicador de digitação:**
- Substituir "Digitando..." por 3 dots animados em sequência (wave bounce), dentro de uma bolha com mesmo estilo do agente
- Streaming text com cursor piscante no final (`|` animado)

**Área de input:**
- Input com fundo `bg-muted/50` e borda interna suave, cantos mais arredondados (`rounded-xl`)
- Botão de envio com gradiente primário e ícone rotacionado 45° (estilo Telegram), com hover glow
- Transição de opacidade no botão quando desabilitado vs habilitado

**Container geral:**
- Sombra multicamada premium (`shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)]`)
- Borda com glow sutil usando `border-primary/10`
- Animação de entrada com `framer-motion` (scale + fade + translateY)

**Banner de transição humana:**
- Quando status muda para `human_handling`, exibir banner inline na conversa com ícone e texto "Um atendente entrou na conversa" com estilo diferenciado (gradiente amber sutil)

## Seção Técnica

- Adicionar `framer-motion` (já instalado) para animações de entrada do container e mensagens
- Manter toda a lógica de negócio (Realtime, streaming, sendMessage) intacta
- Apenas reestruturar o JSX e classes CSS
- Arquivo editado: `src/components/SupportChatWindow.tsx` (somente)

