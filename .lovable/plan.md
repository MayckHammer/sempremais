

# Responsividade e Botão "Solicitar Assistência"

## Problemas atuais
- Itens muito colados no topo (header compacto demais)
- Banner do carrossel pequeno (h-28)
- Falta botão de ação principal abaixo do mapa

## Alterações em `src/components/ClientHome.tsx`

### 1. Mais espaçamento no header
- Aumentar padding top do header de `pt-12` para `pt-14`
- Aumentar padding bottom de `pb-28` para `pb-36` para dar mais espaço ao banner

### 2. Banner maior
- Aumentar altura do banner de `h-28` para `h-36`
- Aumentar padding interno de `p-5` para `p-6`

### 3. Mais respiração no conteúdo
- Aumentar `pt-2` para `pt-6` no container de conteúdo
- Aumentar `space-y-6` para `space-y-8`

### 4. Botão "Solicitar Assistência" abaixo do mapa
- Adicionar um `Button` estilizado com a paleta primary, `rounded-2xl`, largura total, logo após a seção do mapa
- Ao clicar, abre o fluxo de solicitação de serviço (navigate ou modal)

