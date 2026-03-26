

# Carousel nos Destaques (Mobile)

## Problema
Na tela mobile (390px), os 6 ícones de destaques ficam numa linha horizontal com `overflow-x-auto`, mas sem indicação visual de que há mais itens — o usuário não percebe que pode rolar.

## Solução
Usar o componente `Carousel` (Embla) já existente no projeto (`src/components/ui/carousel.tsx`) para exibir os destaques em um carrossel com navegação por swipe no mobile. No desktop, manter todos visíveis.

## Alterações em `src/pages/Index.tsx`

1. **Importar** `Carousel, CarouselContent, CarouselItem` de `@/components/ui/carousel`
2. **Substituir** o `<div className="flex gap-5 overflow-x-auto ...">` pelo componente Carousel
3. Cada `CarouselItem` mostra **3 ícones** lado a lado (2 slides de 3), usando `basis-1/3` nos items internos
4. Configurar `opts={{ align: 'start', loop: true }}` para swipe contínuo
5. Adicionar **dots indicadores** abaixo (pequenos círculos mostrando slide ativo) para sinalizar que há mais conteúdo
6. No desktop (`sm:`), mostrar todos os 6 de uma vez sem carrossel — usar classe condicional ou mostrar o carrossel com todos visíveis

### Estrutura resultante (mobile)
```text
<Carousel opts={{ align: 'start', loop: true }}>
  <CarouselContent>
    <CarouselItem className="basis-1/3"> → ícone 1 </CarouselItem>
    <CarouselItem className="basis-1/3"> → ícone 2 </CarouselItem>
    ...6 items, 3 visíveis por vez
  </CarouselContent>
  <!-- Dots indicadores -->
</Carousel>
```

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Index.tsx` | Trocar flex scroll por Carousel com dots |

