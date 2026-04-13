

## Plan: Campos extras no cadastro B2B e B2C

Mudanças simples no formulário de cadastro (`ClientSignup.tsx`) e na tabela `profiles`.

### O que muda

**B2B (Empresário):**
- "Nome da Empresa" vira "Nome Fantasia *"
- CNPJ passa a ser obrigatório (já existe, só muda o label e validação)

**B2C (Funcionário):**
- Adicionar campo "CNPJ da empresa" (já existe no B2B, mostrar também no B2C)
- Adicionar campo "Cargo na empresa" (novo)

**Público aberto:** Sem mudanças.

### Banco de dados
- Migration: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_role text;`
- Atualizar `handle_new_user()` para salvar `company_role` do metadata

### Arquivos
| Arquivo | Ação |
|---------|------|
| Migration SQL | Adicionar coluna `company_role` |
| `src/pages/auth/ClientSignup.tsx` | Adicionar campo `companyRole`, mostrar CNPJ no B2C, renomear label B2B |
| `src/lib/auth.ts` | Incluir `company_role` no SignUpExtraData |

