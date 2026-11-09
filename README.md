# Ode

Simple Ode builder.

## Setup

1. `npm i`
1. cp `.env.example .env`. You'll need an `ANTHROPIC_API_KEY` set to use the app.
2. `createdb ode`
3. `npm run migrate:dev`
4. `npm run dev`
5. Use the sample app password in `.env` to access the app


## Infra

- Will auto-deploy to Railway on merges to main.

Migrations are run via a pre-deploy step which is set to `npx prisma migrate deploy`.

## Code Structure

This is a simple web app with React/TypeScript on the front-end and Express for the server. Uses prisma & postgres to store shareable odes.

- src/client - Uses [Shadcdn](https://ui.shadcn.com/docs/components) for UI components, and some Ode state components. Writes a few things to localStorage.
- src/server - Routes, simple auth logic (gated by a single env var), ode generator.
- src/shared - used by client and server.
