# Useful commands
- npm run dev: Build the project.

See @package.json for all available commands for this project.

## Code Comments

- Don't add them unless you are asked to do so.

# Documentation

- See @README for an overview.
- Refrain from editing README.md. If you need to, add to `/docs/**` instead.
- Look in the /docs/ folder for comprehensive docs.

## Infrastructure

- You may not manage infrastructure or deployments.

# Code style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Follow all coding styles in eslint/prettier/oxlint/etc configuration.
- Prefer guard clauses whenever possible.
- When you are adding new parameters or lists of imports, sort them alphabetically.

## React
- When adding new React components, make sure to use TitleCase.tsx to name them.

## TypeScript/Javascript
- Prefer arrow functions.

## Communication

- Communicate with humans in a concise manner. Be as short and to the point as possible.

# PRs
- Use the @PULL_REQUEST_TEMPLATE.md if one exists when opening PRs.
- Keep your PR comments and descriptions concise.

# Using Git Worktrees
- If you need to run the app within a worktree, run `npm run worktree` to sync required files.

# Workflow
- Be sure to run linters and fix issues when you're done making a series of code changes.
- Be sure to typecheck when you're done making a series of code changes.

# Tests
- Don't add them unless you are asked to do so.
- Prefer running single tests, and not the whole test suite, for performance.
