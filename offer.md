# Oferta Especial: 2 Meses pelo Preço de 1

## Descrição
Oferta para novos Leads onde o primeiro pagamento de assinatura concede 60 dias (2 meses) de acesso em vez dos 30 dias regulares.

## Lógica de Implementação (Webhook)
Antiga lógica no arquivo `app/api/stripe/webhook/route.tsx`:

```typescript
// Se count de pagamentos concluídos for <= 1, é a primeira assinatura
const isFirstPayment = (count || 0) <= 1;

// Define 60 dias para o primeiro pagamento, 30 para os demais
const daysToAdd = isFirstPayment ? 60 : 30;
```

## UI (Checkout)
Antiga menção no `app/checkout/page.tsx`:
- Badge "Oferta Especial" no resumo do pedido.
- Texto "2 Meses de Acesso" na lista de benefícios.
