

# Redesign da Tela Inicial — Layout Mobile App

## Visão Geral

Substituir a landing page atual por uma tela estilo splash screen de app mobile, usando o background com a curva "S" (azul/cinza/branco) e a logo centralizada no topo, com botões e links de ação.

## Layout Final (mobile-first)

```text
┌─────────────────────────┐
│  Background: curva "S"  │
│  (sempre-fundo.webp)    │
│                         │
│      SEMPRE+            │
│  ASSISTÊNCIAS E         │
│    BENEFÍCIOS           │
│                         │
│                         │
│  ┌───────────────────┐  │
│  │ Preciso de        │  │
│  │ Assistência       │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Sou Cliente -     │  │
│  │ Entrar            │  │
│  └───────────────────┘  │
│                         │
│   Sou Prestador         │
│   Quero me Cadastrar    │
│                         │
└─────────────────────────┘
```

## Alterações

### 1. Copiar imagem de fundo
- Copiar `user-uploads://sempre-fundo.webp` para `src/assets/sempre-fundo.webp`

### 2. Reescrever `src/pages/Index.tsx`
- Remover todo o conteúdo atual (Hero, Destaques, Serviços, CTA, Footer, Header)
- Criar uma tela fullscreen (`min-h-screen`) mobile-first com:
  - **Background**: imagem `sempre-fundo.webp` cobrindo a tela inteira (`bg-cover bg-center`)
  - **Logo**: `logo-sempre-text.png` centralizada no terço superior
  - **Botão 1**: "Preciso de Assistência" — estilo branco/cinza claro com cantos arredondados, leva para `/cadastro/cliente` (ou dashboard se logado)
  - **Botão 2**: "Sou Cliente - Entrar" — mesmo estilo, leva para `/login/cliente`
  - **Link texto 1**: "Sou Prestador" — leva para `/login/prestador`
  - **Link texto 2**: "Quero me Cadastrar" — leva para `/cadastro/prestador`
- Se o usuário já estiver logado, redirecionar para o dashboard correspondente

### 3. Estilo dos botões
- Fundo branco/cinza claro (`bg-white/90`), cantos bem arredondados (`rounded-2xl`)
- Texto escuro, sem borda ou borda sutil
- Sombra leve para profundidade
- Largura fixa ~80% da tela, centralizados

### 4. Links de texto
- Cor branca ou cinza claro para contraste com o fundo
- Fonte menor, centralizado, com `underline` ou sem

| Arquivo | Mudança |
|---------|---------|
| `src/assets/sempre-fundo.webp` | **Novo** — background copiado |
| `src/pages/Index.tsx` | Reescrita completa — tela splash mobile |

