

## Plan: Corrigir aprovação de clientes — RLS policy faltando

### Problema
A tabela `profiles` tem política de UPDATE apenas para o próprio usuário (`auth.uid() = user_id`). Quando o admin tenta aprovar um cliente, o UPDATE é silenciosamente ignorado pelo RLS — sem erro, mas sem efeito.

### Solução
Adicionar uma política RLS que permita admins atualizarem qualquer perfil.

### Alteração

**Migration SQL:**
```sql
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

| Arquivo | Ação |
|---------|------|
| Migration SQL | Adicionar policy de UPDATE para admins na tabela `profiles` |

Nenhuma alteração de código é necessária — o `AdminClients.tsx` já está correto, apenas o banco estava bloqueando a operação.

