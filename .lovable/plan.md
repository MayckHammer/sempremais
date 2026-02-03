

# Ajustes de Layout Mobile - Serviços e Header

## Resumo das Alterações

Vou fazer dois ajustes para melhorar a responsividade da versão mobile:

---

## 1. Centralizar "Destombamento" e "Frete" (Layout 3+2)

**Problema atual:** Os 5 cards de serviço estão em um grid de 3 colunas, fazendo com que "Destombamento" e "Frete" fiquem alinhados à esquerda na segunda linha.

**Solução:** Mudar a estrutura para usar flexbox com `flex-wrap` e `justify-center`, garantindo que os dois últimos itens fiquem centralizados automaticamente.

**Arquivo:** `src/pages/Index.tsx`

```text
Antes:     grid grid-cols-3 (todos alinhados à esquerda)
           [Reboque] [Chaveiro] [Borracheiro]
           [Destomb] [Frete]    [vazio]

Depois:    flex flex-wrap justify-center
           [Reboque] [Chaveiro] [Borracheiro]
                 [Destomb] [Frete]
```

---

## 2. Aumentar a Logo no Header (sem aumentar a altura da barra)

**Problema atual:** A logo no header está com `w-10 h-10` no mobile, poderia ser maior.

**Solução:** Usar `object-contain` com dimensões maiores e `overflow-visible` para que a logo "saia" um pouco da barra visualmente, sem aumentar a altura do container.

**Arquivo:** `src/components/Header.tsx`

**Alterações:**
- Logo mobile: de `w-10 h-10` para `w-14 h-14` 
- Logo desktop: de `w-14 h-14` para `w-16 h-16`
- Adicionar `scale-110` ou ajustar o `object-contain` para permitir que a logo apareça maior visualmente
- Manter o padding do header inalterado para não aumentar a altura da barra

---

## Detalhes Técnicos

### Index.tsx - Seção de Serviços (linhas 77-95)

```jsx
// De:
<div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">

// Para:
<div className="flex flex-wrap justify-center gap-2 sm:gap-4 lg:grid lg:grid-cols-5">
  {/* Cada card terá largura fixa no mobile para manter 3 por linha */}
  <div className="w-[calc(33.333%-0.5rem)] sm:w-auto ...">
```

### Header.tsx - Logo (linhas 70-74)

```jsx
// De:
className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-contain"

// Para:
className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-contain -my-2"
```

O `-my-2` permite que a logo seja maior sem empurrar o conteúdo verticalmente.

---

## Resultado Esperado

- **Serviços:** Os 5 cards ficam em layout 3+2 com "Destombamento" e "Frete" centralizados
- **Header:** Logo visivelmente maior, mantendo a altura compacta da barra de navegação

