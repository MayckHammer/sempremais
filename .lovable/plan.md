

# Efeito Liquid Glass em todo o App

## Resumo

Instalar o pacote `liquid-glass-react` e criar um componente wrapper `GlassContainer` reutilizável. Aplicar esse efeito nos principais containers do app: Header, cards de serviço, cards de destaque, formulários de auth, modais, dashboards e footer.

## Alterações

### 1. Instalar dependência
- Adicionar `liquid-glass-react` ao `package.json`

### 2. Criar componente wrapper `src/components/GlassContainer.tsx`
Componente reutilizável que envolve conteúdo com `<LiquidGlass>`:
```tsx
import LiquidGlass from 'liquid-glass-react';

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  borderRadius?: number;
  blur?: number;
  brightness?: number;
  opacity?: number;
  width?: number | string;
  height?: number | string;
}

export function GlassContainer({ children, className, width = '100%', height = 'auto', borderRadius = 20, blur = 11, brightness = 50, opacity = 0.93, ...rest }: GlassContainerProps) {
  return (
    <LiquidGlass width={width} height={height} borderRadius={borderRadius} blur={blur} brightness={brightness} opacity={opacity} className={className} {...rest}>
      {children}
    </LiquidGlass>
  );
}
```

### 3. Aplicar nos componentes (todos os arquivos abaixo)

| Arquivo | Onde aplicar |
|---------|-------------|
| `src/components/Header.tsx` | Envolver o `<header>` com GlassContainer, manter backdrop-blur existente como fallback |
| `src/pages/Index.tsx` | Cards do Hero, cards de serviços (grid), highlights carousel container, CTA section |
| `src/components/AuthForm.tsx` | Card do formulário (`.bg-card.rounded-3xl`) |
| `src/components/ServiceCard.tsx` | Envolver cada card de serviço |
| `src/components/ServiceRequestModal.tsx` | DialogContent |
| `src/components/RatingModal.tsx` | DialogContent |
| `src/pages/ClientDashboard.tsx` | Cards de localização, lista de prestadores, lista de solicitações |
| `src/pages/ProviderDashboard.tsx` | Stats cards, listas de solicitações |
| `src/components/Footer.tsx` | Container do footer |

### 4. Configuração do efeito glass por contexto

- **Header**: `borderRadius={0}`, `blur={15}`, `opacity={0.85}`, `backgroundOpacity={0.1}`
- **Cards (serviços, destaques)**: `borderRadius={16}`, `blur={11}`, `brightness={50}`, `distortionScale={-180}`
- **Modais**: `borderRadius={24}`, `blur={14}`, `opacity={0.9}`
- **Auth form card**: `borderRadius={24}`, `blur={12}`, `backgroundOpacity={0.05}`
- **CTA section**: `borderRadius={24}`, `blur={10}`, `brightness={45}`
- **Footer**: `borderRadius={0}`, `blur={12}`, `opacity={0.85}`

### Observação
Se `liquid-glass-react` não suportar `height="auto"`, usaremos um div wrapper com posição relativa e o glass como overlay, permitindo que o conteúdo defina a altura naturalmente.

