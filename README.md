# Ode

Make odes with Anthropic! A toy app that allows you to enter a phrase, generate an ode, and then make variants of it.

## System Requirements

- Node 24+
- Postgres

## Setup

1. `npm i` - install dependencies
2. `createdb ode` - create database
3. `cp .env.example .env` - setup environment variables
   1. You'll need an `ANTHROPIC_API_KEY` set to use the app
   2. Set your `DATABASE_URL`, replacing the placeholder username
4. `npm run migrate:dev` - run migrations
5. `npm run dev` - start the app
6. Use the sample app password in `.env` to login


## Infra

- Will auto-deploy to Railway on merges to main.

Migrations are run via a pre-deploy step which is set to `npx prisma migrate deploy`.

## Code Structure

This is a simple web app with React/TypeScript on the front-end and Express for the server. Uses prisma & postgres to store shareable odes.

- src/client - Mostly React. Uses [Shadcdn](https://ui.shadcn.com/docs/components) for UI base components, and includes some rendering utils for drawing mosaics on canvas.
- src/server - Express app with simple auth logic (gated by a single env var), ode generator.
- src/shared - used by client and server.

## Tests

- Visual rendering testing via storybook - `npm run storybook`
- Automated tests via `npm test` which is also run in CI via GitHub Actions.
- To run a single test file: `npm test -- tests/server/routes/gated/odesRouter.test.ts`
- To run all tests matching a path: `npx vitest Router` (matches every test file containing "Router")
