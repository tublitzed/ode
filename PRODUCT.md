# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone who wants to make an ode about anything: a person, a pet, a sandwich, a Tuesday. Most visitors arrive from a link and spend a few minutes.

## Product Purpose

Ode helps people make odes with Anthropic. It is a toy app, not built for scale. Success means a visitor smiles at their ode, then notices the craft behind it.

## Positioning

A small working product that does exactly what its name says: Ode makes odes. The mechanism is quick generate: a person names a subject and Claude writes the ode.

## Operating Context

Access is currently behind a single shared app password. A finished ode is read in the app.

## Capabilities and Constraints

- Flow today: password login, then a form takes a word or phrase ("What should this ode celebrate?"), a progress state shows rotating phrases, then the finished ode, with "Write another ode". Declined topics get a reason and three suggested topics.
- Ode format, set by the system prompt in `src/server/odes/generate.ts`: free verse in very short enjambed lines, often one to four words, up to 30 lines counting blank lines, warm and a little playful. No title in the body; the UI titles it "Ode to {topic}". The response arrives whole, not streamed.
- Later, not now: finished odes become shareable. Do not build sharing yet.
- Stack: React, Tailwind and shadcn/ui on an Express server, with Storybook, deployed on Railway.

## Brand Commitments

- Name: Ode.
- Voice: playful range. Light by default, and able to run from silly to sincere for each ode.
- No logo or other brand assets exist yet.

## Evidence on Hand

None. No sample odes, users, testimonials or usage data exist, and none should be fabricated or implied to be real. Odes in comps are clearly placeholder content.

## Product Principles

1. Any subject is worthy. Nothing is too small or too silly for an ode.
2. The ode is the point. Everything else in the product serves making it and reading it.
3. Range over register. The product supports silly and sincere, and does not lock one tone in.
4. Keep it a toy. Prefer delight and simplicity over features built for scale.
5. The joke opens the door, and the craft closes the deal. Every screen should also show engineering and design judgment.
