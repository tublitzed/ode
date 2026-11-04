# Shared odes

Shared odes are stored in Postgres through Prisma.

## Local setup

1. Create a database: `createdb ode_dev`
1. Set `DATABASE_URL` in `.env`, including your Postgres username: `postgresql://YOUR_USER@localhost:5432/ode_dev`
1. Generate the client: `npx prisma generate`
1. Apply migrations: `npx prisma migrate dev`

The server won't start without `DATABASE_URL`.

## Deploying

The Railway app service needs `DATABASE_URL` pointing at a Postgres service. `npm run build` generates the client, and `npm start` applies pending migrations before starting the server.

## Removing a shared ode

There's no UI for this. Find the id in the link (`/o/<id>`), then run this against the database:

```sql
DELETE FROM shared_odes WHERE id = '<id>';
```
