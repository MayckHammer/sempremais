

# Integrar UnicornStudio como Background do Hero

## Resumo

Substituir os blobs animados (lava lamp) do hero por uma cena UnicornStudio usando o componente React oficial, mantendo o conteúdo (logo, card, botões) sobreposto.

## Alterações

### 1. Instalar dependência
- Adicionar `unicornstudio-react` ao `package.json`

### 2. `src/pages/Index.tsx`
- Importar `UnicornScene` de `unicornstudio-react`
- **Remover** os 4 blobs `<motion.div>` (linhas 44-90) e o noise texture div
- **Substituir** por `<UnicornScene>` com `projectId="95VHuHaMwQgzQ7FNBU4u"`, ocupando 100% do container (`width="100%"`, `height="100%"`)
- Manter o wrapper `absolute inset-0 overflow-hidden` para que a cena fique atrás do conteúdo
- Ajustar `dpi` para `1` em mobile (performance) e `1.5` em desktop
- Todo o conteúdo do hero (logo, card, botões) permanece com `relative z-10`

### Estrutura resultante

```text
<section ref={heroRef} className="relative overflow-hidden">
  ├── <div className="absolute inset-0">        ← background
  │     └── <UnicornScene projectId="..." />     ← cena animada
  ├── <div className="relative z-10 ...">        ← conteúdo
  │     ├── logo
  │     └── card com botões
</section>
```

## Arquivos

| Arquivo | Mudança |
|---------|---------|
| `package.json` | Adicionar `unicornstudio-react` |
| `src/pages/Index.tsx` | Trocar blobs por `<UnicornScene>` |

