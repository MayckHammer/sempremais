

# Substituição da Logo - Versão com Escrita Branca

## Resumo

Substituir a logo atual por uma nova versão com escrita branca para dar mais destaque no tema escuro da plataforma. Os tamanhos atuais serão mantidos em todos os locais.

---

## Alterações

### 1. Copiar Nova Logo para o Projeto

Copiar o arquivo `Logo2.png` enviado pelo usuário para substituir a logo atual:

**Ação:** `lov-copy user-uploads://Logo2.png src/assets/logo.png`

Isso substituirá o arquivo existente `src/assets/logo.png` pela nova versão com escrita branca.

---

### 2. Arquivos que Usam a Logo (sem alteração de código necessária)

Como ambos os arquivos importam a logo assim:
```typescript
import logo from '@/assets/logo.png';
```

E o arquivo será substituído no mesmo local, **não será necessário alterar nenhum código**. Os tamanhos continuarão:

| Local | Tamanho Mobile | Tamanho Desktop |
|-------|----------------|-----------------|
| Header (logo principal) | w-20 h-20 | w-24 h-24 |
| Header (menu lateral) | w-10 h-10 | - |
| Hero Section | w-48 h-48 | w-64 h-64 |

---

## Resultado Esperado

- A nova logo com escrita branca terá mais destaque no fundo escuro
- Todos os tamanhos permanecerão iguais aos atuais
- A transição será transparente sem necessidade de alterar código

