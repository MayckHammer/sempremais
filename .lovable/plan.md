

# Adicionar webhook n8n ao fluxo de solicitação

## Resumo

Adicionar chamada fire-and-forget ao webhook de produção do n8n logo após a classificação de urgência, enviando os dados da solicitação para orquestração externa.

## Alteração

| Arquivo | Ação |
|---|---|
| `src/pages/RequestService.tsx` | Adicionar fetch ao webhook n8n após classify-urgency |

## Detalhe

No `handleSubmit`, logo após a linha do `classify-urgency`, inserir:

```typescript
// Notifica o n8n para orquestração do fluxo
fetch('https://mayckhammer.app.n8n.cloud/webhook/54b541fe-ef7e-4269-b037-ed1d90544957', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    request_id: inserted.id,
    service_type: serviceType,
    address: originAddress,
    vehicle_info: vehicleInfo,
    client_name: profile?.full_name || 'Cliente',
    created_at: new Date().toISOString(),
  }),
}).catch(() => {});
```

URL de produção (`webhook/` sem `-test`) para funcionar 24/7.

