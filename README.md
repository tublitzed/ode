# Ode

Simple Ode builder.


## Setup

1. cp `.env.example .env`
1. `npm i` && `npm run dev`
1. Use the sample app password in `.env` to access the app


## Hosting

1. Will auto-deploy to Railway on merges to main.

## Code Structure

This is a simple web app with React/TypeScript on the front-end and Express for the server:

- src/client - Uses [Shadcdn](https://ui.shadcn.com/docs/components) for UI components, and some Ode state components. Writes a few things to localStorage.
- src/server - Routes, simple auth logic (gated by a single env var), ode generator.
- src/shared - used by client and server.
