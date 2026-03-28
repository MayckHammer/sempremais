

# Ajuste do Header do Perfil + Dados do Usuário

## Problema
O header azul com `pb-24` está muito alto, sobrepondo o primeiro accordion "Dados Pessoais". Além disso, o perfil do usuário `mayckhammersavecar@gmail.com` precisa ter nome "Mayck Hammer" e localização "Uberlândia - MG" cadastrados no banco.

## Mudanças

### 1. `src/pages/ClientProfile.tsx` — Reduzir altura do header
- Alterar `pb-24` para `pb-16` no container do header azul
- Reduzir `mt-5` do bloco avatar para `mt-3`
- Isso diminui a área azul e libera espaço para o accordion ficar visível sem sobreposição

### 2. Banco de dados — Atualizar perfil do usuário
- Executar migration para atualizar o `full_name`, `city` e `state` do perfil vinculado ao email `mayckhammersavecar@gmail.com`:

```sql
UPDATE public.profiles
SET full_name = 'Mayck Hammer',
    city = 'Uberlândia',
    state = 'MG'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'mayckhammersavecar@gmail.com'
);
```

## Detalhes técnicos
- A redução do padding (`pb-24` → `pb-16`) mantém a curva SVG e o avatar visíveis, mas recua o header ~32px
- O nome e localização já são exibidos pelo código existente via `profile?.full_name` e `locationText`
- A migration garante que os dados apareçam corretamente para esse usuário específico

