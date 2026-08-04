# jairco

The jairco discord bot.

Active branch: `v2` — full overhaul: new modular architecture. PR base: `master`.

## Tech stack

- Node `^22.13.0`, TypeScript `^7.0.2` (strict by default — see note below)
- Backend: Inversify 8 (DI), Prisma 7 + Postgres, Zod 4
- Discord: discord.js ^14
- Tooling: Biome 2.4 (lint + format), CUID2 for IDs

## Commands

| Command | What |
| --- | --- |
| `npm run dev` | Dev server — `tsx watch src/index.ts` |
| `npm run build` | `tsc` then `tsc-alias` (rewrites `@/` imports to relative paths in `dist/`) |
| `npm run start` | Run the built `dist/index.js` |
| `npm run type-check` | `tsc --noEmit` |
| `npm run format` | Biome format check (read-only) |
| `npm run lint` | Biome check — lint + format + import organization (read-only) |
| `npm run prisma <args>` | Prisma CLI (custom config via `--config`) |

**Passing flags through:** on this npm (11.x), a single `--` before a flag-like arg (e.g. `npm run lint -- --write`) prints an "Unknown cli config" warning and silently doesn't forward it — use `---` (triple dash) instead: `npm run lint --- --write` actually applies Biome's fixes, `npm run format --- --write` writes formatting. Positional (non-flag) args don't need any dash at all: `npm run prisma generate` works directly (that's what CI does). There is no `check` or `check:fix` script — use `format`/`lint` directly.

## Architecture

Clean-architecture / DDD-lite. Three layers per feature.

```
src/
├── di/
│   ├── container.ts        # Inversify container — SHARED bindings only, then loads feature modules
│   └── DiTypes.ts          # All DI tokens (one `as const` object)
├── modules/<feature>/      # feature modules (auth, users today)
│   ├── domain/             # entities, value objects, domain services, repository INTERFACES
│   ├── application/        # use cases, DTOs, application services, interfaces
│   ├── infrastructure/     # Prisma repos, external adapters, <Feature>Module.ts (Inversify)
│   └── presenter/discord/
│       ├── commands/       # slash command definitions + handlers (ICommand)
│       ├── events/         # feature's own IDiscordEvent classes, physically local
│       ├── components/     # feature-specific interaction handlers
│       │   ├── buttons/
│       │   ├── selectMenus/
│       │   └── modals/
│       └── embeds/         # feature embeds extending BaseEmbed
└── shared/                 # cross-cutting building blocks
    ├── application/        # interfaces: ILogger, IDateProvider, IIdGenerator, …
    ├── infrastructure/     # Prisma service, NodeDateProvider, Cuid2IdGenerator, ConsoleLogger, …
    ├── kernel/             # Result / error / value-object base types
    └── presenter/discord/
        ├── bootstrap/          # bot startup / composition root
        │   ├── DiscordBot.ts        # builds client, logs in, wires everything together
        │   ├── CommandRegistry.ts   # collects all ICommand, registers w/ Discord API
        │   ├── EventDispatcher.ts   # single per-event listener, fans out to module event classes
        │   ├── ComponentRegistry.ts # single interactionCreate listener, routes by customId
        │   └── deployCommands.ts    # standalone script for `PUT /commands`
        ├── contracts/          # abstract classes & interfaces modules implement
        │   ├── ICommand.ts
        │   ├── IDiscordEvent.ts
        │   ├── BaseButtonHandler.ts
        │   ├── BaseSelectMenuHandler.ts
        │   ├── BaseModalHandler.ts
        │   └── BaseEmbed.ts
        ├── commands/           # no-domain-logic commands (ping, help…)
        ├── events/             # framework-level events (ready, warn, error)
        ├── components/         # generic reusable buttons/menus/modals (pagination, confirm/cancel)
        │   ├── buttons/
        │   ├── selectMenus/
        │   └── modals/
        └── embeds/             # generic embeds (ErrorEmbed, SuccessEmbed…) extending BaseEmbed
```

Direction: `domain` knows nothing of `application` or `infrastructure`; `application` depends on `domain` and on interfaces; `infrastructure` implements those interfaces. Never import infrastructure from domain.

## DI conventions

- Tokens live in `src/di/DiTypes.ts` (`Symbol.for(...)` values, grouped by feature with comments).
- **Shared** services are bound directly in `src/di/container.ts`.
- **Feature** services are bound in `src/modules/<feature>/infrastructure/<Feature>Module.ts` (a `ContainerModule`), then loaded from `container.ts` via `container.load(AuthModule, UserModule, …)`.
- Constructor injection with decorators. `experimentalDecorators` + `emitDecoratorMetadata` are on; Biome's `unsafeParameterDecoratorsEnabled` is on.

When adding a feature:
1. Create `src/modules/<feature>/{domain,application,infrastructure}/`.
2. Add tokens to `DiTypes.ts` under a `// <Feature>` comment block.
3. Create `infrastructure/<Feature>Module.ts` as a `new ContainerModule(({ bind }) => { … })`.
4. Import and load it in `src/di/container.ts`.
5. If persisted: add models to `src/shared/infrastructure/persistence/prisma/schema.prisma` and run `npm run prisma generate`.
6. Add bot presenter: create `src/modules/<feature>/presenter/discord/{commands,events,components/{buttons,selectMenus,modals},embeds}/`. Bind commands/events/components to the shared multi-inject tokens (see below) — `CommandRegistry`, `EventDispatcher`, `ComponentRegistry` in `src/shared/presenter/discord/bootstrap/` pick them up automatically via DI.

## Presenter conventions

- Presenter code lives at `src/modules/<feature>/presenter/discord/`:
  - `commands/` — slash command definitions + handlers, implementing `ICommand`
  - `events/` — `IDiscordEvent` classes scoped to this feature (physically local to the module; dispatch is centralized, see below)
  - `components/{buttons,selectMenus,modals}/` — feature-specific interaction handlers, each extending the matching `Base*Handler`
  - `embeds/` — feature embeds extending `BaseEmbed`
- Shared, reusable bot infra lives in `src/shared/presenter/discord/`:
  - `bootstrap/` — the composition root. `DiscordBot.ts` builds the client and logs in; `CommandRegistry.ts` / `EventDispatcher.ts` / `ComponentRegistry.ts` wire up commands, events, and components across all modules; `deployCommands.ts` is the standalone `PUT /commands` script. This is the only place allowed to know the full picture (all registries, the client, login sequencing).
  - `contracts/` — `ICommand`, `IDiscordEvent`, `BaseButtonHandler`, `BaseSelectMenuHandler`, `BaseModalHandler`, `BaseEmbed`. Modules implement/extend these; contracts don't know about bootstrap.
  - `commands/`, `events/`, `components/{buttons,selectMenus,modals}/`, `embeds/` — generic, no-domain-logic equivalents (ping/help commands, ready/warn/error events, pagination/confirm components, ErrorEmbed/SuccessEmbed).
- **Events**: there's exactly one real `client.on(...)` per Discord event name, in `EventDispatcher.ts`. Every feature's `IDiscordEvent` class is bound to a shared multi-inject token; the dispatcher loops over the injected instances, filters by the event name each class declares, and calls `.execute()` on the matches. Event code stays physically owned by its module even though dispatch is centralized.
- **Components**: same pattern as events. `ComponentRegistry.ts` sets up a single `interactionCreate` listener, branches by interaction type (button/select-menu/modal/autocomplete), and routes to the matching handler by `customId`. Handlers are bound to shared multi-inject tokens and extend the relevant `Base*Handler` (customId/prefix matcher + `execute()`).
- **Autocomplete** is tightly coupled to its command, so it's an optional `autocomplete()` hook on the command class (or a sibling file next to it) — not its own component category.
- **Embeds** extend `BaseEmbed`. Keep them pure — no DI, no side effects.

## Code conventions

- **Imports: `@/` path alias only.** `@/*` resolves to `./src/*`. No relative imports (`./`, `../`) — anywhere, including same-folder. This is a hard rule.
- **TS extensions on imports.** `allowImportingTsExtensions` is on; write `import { X } from "@/foo/Bar.ts"` (note the `.ts`).
- **IDs**: use `IIdGenerator` (CUID2) via DI. Never roll your own.
- **Dates**: use `IDateProvider` via DI. Never call `new Date()` directly in application/domain code.
- **Logging**: use `ILogger` via DI.
- **Validation**: Zod at edges only (request DTOs, env config). Domain types don't re-validate.
- **Errors**: use `ResultType<T, E>` (`src/shared/kernel/types/ResultType.ts`) with the `okRes`/`errRes` helpers (`src/shared/kernel/lib/`) and `AppError` (`src/shared/kernel/errors/AppError.ts`). Don't throw across application boundaries.
- **Style**: Biome enforces — double quotes, organized imports, space indent. Don't fight it.
- **TS strictness**: TypeScript 7 enables the full `strict` family (`strictNullChecks`, `noImplicitAny`, `strictPropertyInitialization`, `useUnknownInCatchVariables`, etc.) **by default** — `tsconfig.json` has no `strict: true` and doesn't need one. On top of that it explicitly sets `noUnusedLocals` and `noFallthroughCasesInSwitch`. Don't add `strict: false` or per-flag opt-outs to route around this; keep edits clean under the default strictness.

## Testing

No test runner is wired up yet — there's no `vitest` dependency or `test` script on v2. When that lands:
- Colocate as `*.test.ts` next to the source file.
- Prefer testing application use cases against fakes/in-memory repos over end-to-end.
- Domain layer should be trivially testable — pure functions / pure objects.

## CI

`.github/workflows/ci.yaml` has two jobs on PR / push to `master`: `quality` runs `biome ci .` directly (via `biomejs/setup-biome`), `validation` runs `npm ci`, `npm run prisma generate`, then `npm run type-check`. Don't merge red.

## Don'ts

- Don't use relative imports — `@/` alias only.
- Don't bind feature services in `src/di/container.ts` — they belong in the feature's `<Feature>Module.ts`.
- Don't invent a `check`/`check:fix` script — use `format`/`lint` directly. Don't use a single `--` to pass flags through npm (silently swallowed on this npm version) — use `---` (`npm run lint --- --write`).
- Don't add libraries when `shared/` already covers it (logger, date provider, ID provider, ResultType/AppError).
- Don't remove enabled `tsconfig.json` compiler options, add `strict: false`/per-flag strict opt-outs, or disable Biome rules per-file without a real reason.
- Don't introduce new top-level directories without asking.
- Don't write multi-paragraph JSDoc — names + types should carry meaning.
