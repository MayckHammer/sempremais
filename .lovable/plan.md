

# Nova Página "Solicitar Assistência"

## Objetivo
Ao clicar em "Solicitar Assistência" no dashboard do cliente, navegar para uma nova página onde o usuário escolhe o tipo de serviço e define a localização de origem e destino no mapa, conforme o print de referência.

## Layout (seguindo o print)
- Fundo é o mapa em tela cheia (Google Maps embed)
- Na parte inferior, um painel branco arredondado no topo com 3 campos:
  1. **Tipo de serviço** — Select/dropdown com opções: Reboque (Guincho), Chaveiro, Borracheiro, Destombamento, Frete Pequeno, Frete Grande
  2. **Localização atual** — Campo com ícone de pin que mostra o endereço atual (auto-detectado via geolocalização)
  3. **Localização de destino** — Campo para informar o destino do serviço
- Botão primário azul "Solicitar" na parte inferior

## Alterações

### 1. Criar `src/pages/RequestService.tsx`
- Página full-screen com mapa de fundo (iframe Google Maps centralizado na localização do usuário)
- Painel inferior com `rounded-t-3xl`, fundo branco, shadow
- Select para tipo de serviço (usando componente `Select` existente)
- Dois campos de localização com ícones de MapPin
- Botão de voltar no topo
- Ao submeter, cria o `service_request` no banco e navega de volta

### 2. Atualizar `src/App.tsx`
- Adicionar rota `/cliente/solicitar` → `RequestService`

### 3. Atualizar `src/components/ClientHome.tsx`
- Alterar o onClick do botão "Solicitar Assistência" de `navigate('/cliente')` para `navigate('/cliente/solicitar')`

### Arquivos afetados
- `src/pages/RequestService.tsx` (novo)
- `src/App.tsx` (nova rota)
- `src/components/ClientHome.tsx` (link do botão)

