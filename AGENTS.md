# Useful commands
- npm run dev: Build the project.

See @package.json for all available commands for this project.

# General Rules

- This is a toy app, not an app designed for many users at scale. Keep this in mind when writing code; notify of edge cases but don't try to handle them all.

# Code Comments

- Don't add them unless you are asked to do so.

# Communication

- Communicate with humans in a concise manner. Be as short and to the point as possible.

# Documentation

- See @README for an overview.
- Refrain from editing README.md. If you need to, add to `/docs/**` instead.

# Infrastructure

- You may not manage infrastructure or deployments.

# Code style
- Prefer readability over cleverness, every time.
- Use ES modules (import/export) syntax, not CommonJS (require)
- Follow all coding styles in eslint/prettier/oxlint/etc configuration.
- Prefer guard clauses whenever possible.
- When you are adding new parameters or lists of imports, sort them alphabetically.

## React
- When adding new React components, make sure to use TitleCase.tsx to name them.

## TypeScript/Javascript
- Prefer arrow functions.

## Working with 3rd party libs
- If you see a method marked as deprecated, don't use it without good reason to do so (and ask first).

# Workflow
- Do not run the app against the default PORT, use a different port to avoid conflicting with other developers. When you are done running the app, release the port.
- Be sure to run linters and fix issues when you're done making a series of code changes.
- Be sure to typecheck when you're done making a series of code changes.
- Run `npx prisma format` when making schema changes.

## Using Git Worktrees
- If you need to run the app within a worktree, run `npm run worktree` to sync required files.

## PRs
- Use the @PULL_REQUEST_TEMPLATE.md if one exists when opening PRs.
- Keep your PR comments and descriptions concise.

## Tests
- Don't add them unless you are asked to do so.
- Prefer running single tests, and not the whole test suite, for performance.
- Follow the app's directory structure where possible when adding new test files.
