

# Adicionar Logo como Marca d'Água no Rodapé

## Resumo

Adicionar a logo Mi Rebok como marca d'água no rodapé da página, criando um visual mais profissional e reforçando a identidade da marca.

---

## Alterações

### 1. Modificar o Footer em `src/pages/Index.tsx`

Atualizar a seção do rodapé (linhas 214-219) para incluir a logo como marca d'água:

**De:**
```jsx
<footer className="py-6 sm:py-8 px-4 border-t border-border">
  <div className="max-w-6xl mx-auto text-center text-muted-foreground">
    <p className="text-xs sm:text-sm">© 2024 Mi Rebok - Guincho e Assistência 24h</p>
  </div>
</footer>
```

**Para:**
```jsx
<footer className="relative py-6 sm:py-8 px-4 border-t border-border overflow-hidden">
  {/* Logo como Marca d'Água */}
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <img 
      src={logo} 
      alt="" 
      className="w-32 h-32 sm:w-48 sm:h-48 object-contain opacity-5"
    />
  </div>
  
  <div className="max-w-6xl mx-auto text-center text-muted-foreground relative z-10">
    <p className="text-xs sm:text-sm">© 2024 Mi Rebok - Guincho e Assistência 24h</p>
  </div>
</footer>
```

---

## Detalhes Técnicos

| Propriedade | Valor | Descrição |
|-------------|-------|-----------|
| Posicionamento | `absolute inset-0` | Centraliza a logo no fundo do footer |
| Opacidade | `opacity-5` | 5% de opacidade para efeito sutil de marca d'água |
| Tamanho | `w-32 h-32` (mobile) / `w-48 h-48` (desktop) | Dimensões responsivas |
| Interação | `pointer-events-none` | A marca d'água não interfere em cliques |
| Z-index | Texto com `z-10` | Garante que o copyright fique acima da marca d'água |

---

## Resultado Esperado

- Logo aparecerá como marca d'água sutil e centralizada no rodapé
- O texto de copyright permanecerá legível sobre a marca d'água
- Visual mais profissional e reforço da identidade da marca
- A logo já importada no arquivo será reutilizada (versão com texto branco)

