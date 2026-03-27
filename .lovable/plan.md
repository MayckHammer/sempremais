

# Login Inline na Tela Inicial (Sem Navegação)

## Objetivo
Ao clicar em "Sou Cliente - Entrar", em vez de navegar para `/login/cliente`, um card de login sobe com animação na mesma tela. O card contém campos de email e senha, link "Esqueci a senha", e 3 botões pequenos com ícones de WhatsApp, Instagram e Facebook.

## Alterações

### 1. `src/pages/Index.tsx`
- Adicionar estado `showLogin` (boolean).
- Trocar o `<Link to="/login/cliente">` do botão "Sou Cliente - Entrar" por um `onClick` que seta `showLogin = true`.
- Quando `showLogin` é true, usar `AnimatePresence` + `motion.div` para animar um card subindo de baixo (slide-up), substituindo os botões de ação.
- O card terá:
  - Campos de email e senha (usando `Input` existente)
  - Link "Esqueci a senha" logo abaixo dos campos
  - 3 caixinhas lado a lado com ícones de WhatsApp, Instagram e Facebook (usando `lucide-react` para os ícones disponíveis, ou SVG inline para WhatsApp/Facebook)
  - Botão de submit "Entrar"
  - Link "← Voltar" para fechar o card e voltar aos botões
- A lógica de login chama `signIn(email, password, 'client')` do `@/lib/auth` e navega para `/cliente` em caso de sucesso.
- O fundo e a logo permanecem visíveis; apenas a parte inferior muda.

### 2. Estilo do card
- Background `rgba(255,255,255,0.9)` com `backdrop-blur`, `rounded-3xl`, seguindo o padrão visual dos GlowCards e da imagem de referência.
- Os 3 botões de redes sociais são caixinhas arredondadas brancas lado a lado, cada uma com o ícone correspondente.

### Nenhum outro arquivo precisa ser alterado
A rota `/login/cliente` continua existindo para acesso direto, mas o fluxo principal da tela inicial não navega mais para ela.

