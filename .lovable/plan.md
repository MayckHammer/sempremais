

# Cadastro Profissional do Associado

## Contexto
A página de cadastro de cliente atual (`/cadastro/cliente`) é muito simples (nome, telefone, email, senha). Precisamos de um formulário profissional com dados importantes para o time de cadastro e para o negócio. Além disso, o banner "Seja assinante e pague menos!" na página `/assistencia` e o link "Quero me Cadastrar" na Index devem levar a essa nova tela.

## O que será feito

### 1. Nova página de cadastro completa (`src/pages/auth/ClientSignup.tsx`)
Substituir o componente simples por um formulário profissional com os seguintes campos:

**Dados Pessoais:**
- Nome Completo (obrigatório)
- CPF (obrigatório)
- Data de Nascimento (obrigatório)
- Telefone/WhatsApp (obrigatório)
- Email (obrigatório)
- Senha (obrigatório)

**Endereço:**
- CEP (com auto-preenchimento via ViaCEP)
- Rua, Número, Complemento
- Bairro, Cidade, Estado

**Veículo (opcional):**
- Marca/Modelo
- Placa
- Ano
- Cor

Layout: manter o visual S-Curve hero com logo no topo (mesmo padrão do AuthForm atual), formulário em card com seções separadas por títulos. Design mobile-first (390px viewport).

### 2. Banco de dados - Expandir tabela `profiles`
Adicionar colunas:
- `cpf` (text, nullable)
- `birth_date` (date, nullable)
- `cep` (text, nullable)
- `street` (text, nullable)
- `street_number` (text, nullable)
- `complement` (text, nullable)
- `neighborhood` (text, nullable)
- `city` (text, nullable)
- `state` (text, nullable)
- `vehicle_brand` (text, nullable)
- `vehicle_model` (text, nullable)
- `vehicle_plate` (text, nullable)
- `vehicle_year` (text, nullable)
- `vehicle_color` (text, nullable)

### 3. Atualizar fluxo de signup (`src/lib/auth.ts`)
Expandir a função `signUp` para aceitar os novos campos e salvá-los na tabela `profiles` após o cadastro (ou via trigger/update posterior).

### 4. Links que devem apontar para `/cadastro/cliente`
- **Index.tsx**: "Quero me Cadastrar" → mudar de `/cadastro/prestador` para `/cadastro/cliente`
- **GuestRequestService.tsx**: Banner "Seja assinante" → adicionar link para `/cadastro/cliente`

## Arquivos afetados
- **Reescrever:** `src/pages/auth/ClientSignup.tsx` (formulário completo)
- **Editar:** `src/lib/auth.ts` (expandir signUp), `src/pages/Index.tsx` (link), `src/pages/GuestRequestService.tsx` (link no banner)
- **Migração:** adicionar colunas à tabela `profiles`

