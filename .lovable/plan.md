

# Adicionar indicadores de navegação no carrossel de banners

## Problema
O carrossel de banners roda automaticamente mas o cliente não tem como voltar ou avançar manualmente entre os destaques.

## Mudanças em `src/components/ClientHome.tsx`

1. **Importar `CarouselPrevious` e `CarouselNext`** do carousel component
2. **Adicionar botões de navegação** dentro do `<Carousel>`, após o `<CarouselContent>`
3. **Estilizar os botões** para ficarem sobrepostos nas laterais do banner, semi-transparentes, tamanho pequeno (`h-7 w-7`), com fundo `bg-white/30` e ícone branco para combinar com o visual dos banners
4. **Adicionar dots indicadores** abaixo do carrossel mostrando qual banner está ativo — usando estado com `setApi` do Embla para rastrear o slide atual

### Layout visual
```text
┌──────────────────────────────┐
│  ◀  [  Banner Destaque  ]  ▶ │
│         ● ○ ○ ○              │
└──────────────────────────────┘
```

### Detalhes técnicos
- Usar `setApi` do Carousel para obter a API do Embla e rastrear `selectedScrollSnap`
- Posicionar `CarouselPrevious` e `CarouselNext` com classes customizadas: `left-2` e `right-2` (dentro do banner, não fora)
- Dots: renderizar `banners.map` com bolinha ativa (`bg-primary`) e inativas (`bg-primary/30`)
- Alterar Autoplay para `stopOnInteraction: true` para pausar quando o usuário interagir manualmente

