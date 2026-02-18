# LeadFlow Backend

API backend do LeadFlow (Fastify + TypeScript + Prisma + PostgreSQL).

## Stack

- Node.js 20
- Fastify
- Prisma ORM
- PostgreSQL
- JWT

## Setup rápido

1. Instale dependências:

```bash
npm install
```

2. Configure variáveis de ambiente:

```bash
cp .env.example .env
```

3. Rode migrations:

```bash
npx prisma migrate deploy
```

4. Inicie a API:

```bash
npm run dev
```

API padrão em `http://localhost:3333`.

## Autenticação e multi-tenant

- Rotas protegidas usam `preHandler: app.authenticate`.
- O JWT carrega:
  - `userId`
  - `workspaceId`
- **Toda consulta de negócio é filtrada por `workspaceId` no backend**.

## Contrato de resposta da API

### Sucesso

Todas as rotas retornam envelope padrão:

```json
{
  "data": {}
}
```

Exemplos:

```json
{
  "data": {
    "token": "jwt-token"
  }
}
```

```json
{
  "data": [
    {
      "id": "lead_1",
      "name": "Maria"
    }
  ]
}
```

### Erro

Erros seguem envelope padrão:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem amigável",
    "details": null
  }
}
```

Mapeamento atual:

- `400 VALIDATION_ERROR`: payload inválido (Zod)
- `401 UNAUTHORIZED`: credenciais inválidas / não autenticado
- `403 FORBIDDEN`: sem permissão de acesso
- `404 NOT_FOUND`: recurso não encontrado
- `409 CONFLICT`: conflito de unicidade ou regra de domínio
- `500 INTERNAL_SERVER_ERROR`: erro não tratado

## Endpoints

### Auth

- `POST /auth/register`
- `POST /auth/login`

Resposta de sucesso:

```json
{
  "data": {
    "token": "jwt-token"
  }
}
```

### Leads

- `POST /leads`
- `GET /leads`
- `PATCH /leads/:leadId/status`

Status de lead:

- `NEW`
- `CONTACTED`
- `WON`
- `LOST`

### FollowUps

- `POST /followups`
- `GET /followups/lead/:leadId`
- `GET /followups/today`
- `GET /followups/overdue`
- `GET /followups/upcoming`
- `PATCH /followups/:followUpId/done`

### Metrics

- `GET /metrics/leads-overview`

### Activities

- `GET /activities`

## Observações para frontend

- Sempre leia payload em `response.data.data`.
- Sempre trate erros em `response.data.error`.
- Nunca envie `workspaceId` por payload para confiar em autorização; ele vem do JWT no backend.
