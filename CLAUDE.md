# jairco

The jairco discord bot.

Active branch: `v2-refactor` — full overhaul: new modular architecture. PR base: `master`.

## Tech stack

- Node `>=22.13.0` (the `engines` field), TypeScript `^7.0.2` (strict by default — see note below)
- Backend: Inversify 8 (DI), Prisma 7 + Postgres (`@prisma/adapter-pg`), Zod 4; `reflect-metadata` + `dotenv` at the entrypoint
- Discord: discord.js ^14
- Tooling: Biome 2.5 (lint + format), CUID2 for IDs

## Commands

| Command | What |
| --- | --- |
| `npm run dev` | Dev server — `tsx watch src/shared/presenter/discord/index.ts` |
| `npm run build` | `tsc` then `tsc-alias` (rewrites `@/` imports to relative paths in `dist/`) |
| `npm run start` | Run the built `dist/index.js` |
| `npm run type-check` | `tsc --noEmit` |
| `npm run format` | `biome format` (read-only) |
| `npm run lint` | `biome check` — lint + format + import organization (read-only) |
| `npm run prisma <args>` | Prisma CLI — always injects `--config ./src/shared/infrastructure/persistence/prisma/prismaConfig.ts` |

**Passing flags through:** on this npm (11.x), a single `--` before a flag-like arg (e.g. `npm run lint -- --write`) prints an "Unknown cli config" warning and silently doesn't forward it — use `---` (triple dash) instead: `npm run lint --- --write` actually applies Biome's fixes, `npm run format --- --write` writes formatting. Positional (non-flag) args don't need any dash at all: `npm run prisma generate` works directly (that's what CI does). There is no `check` or `check:fix` script — use `format`/`lint` directly.

## Architecture

Clean-architecture / DDD-lite. Three layers per feature.

```
src/
├── di/
│   ├── container.ts        # builds the Inversify Container + container.load(...) of every module
│   └── DiTypes.ts          # thin aggregator: re-exports each module's *DiTypes token object
├── modules/<feature>/      # feature modules (groups, guilds, users today)
│   ├── <Feature>DiTypes.ts # this module's DI tokens (`as const` of Symbol.for(...))
│   ├── <Feature>Module.ts  # this module's Inversify ContainerModule (bindings)
│   ├── domain/             # entities, value objects, rules (no repository interfaces)
│   ├── application/
│   │   ├── interfaces/     # repository + service INTERFACES (e.g. IGroupRepository)
│   │   ├── usecases/       # use cases
│   │   └── dtos/           # DTOs
│   ├── infrastructure/
│   │   ├── repositories/   # Prisma repos implementing application interfaces (Prisma<X>Repository)
│   │   ├── mappers/        # domain <-> persistence mappers
│   │   └── schemas/        # this module's *.prisma model files (split schema)
│   └── presenter/discord/  # target shape — see "Presenter conventions" (only scaffolded today)
│       ├── commands/       # slash command definitions + handlers
│       ├── events/         # feature's own event classes, physically local
│       ├── components/     # feature-specific interaction handlers
│       └── messages/       # feature reply builders
└── shared/                 # cross-cutting building blocks
    ├── SharedDiTypes.ts    # shared tokens (Logger, DateProvider, IdGenerator, DatabaseTransactionManager)
    ├── SharedModule.ts     # binds shared services (ConsoleLogger, NodeDateProvider, Cuid2IdGenerator, Prisma…)
    ├── application/        # interfaces: ILogger, IDateProvider, IIdGenerator, IDatabaseTransactionManager, …
    ├── infrastructure/     # persistence/ (Prisma service, transaction manager), logging/, date/, ids/
    ├── kernel/             # types/ (ResultType, MaybePromise, UseCase), lib/ (okRes/errRes), errors/, values/
    └── presenter/discord/
        ├── DiscordDiTypes.ts   # Client, Command, ContextMenu, Event tokens
        ├── DiscordModule.ts    # binds the client, registries, events, commands
        ├── bootstrap/          # composition root
        │   ├── createDiscordClient.ts  # builds the client
        │   ├── CommandRegistry.ts       # collects all commands, registers w/ Discord API
        │   ├── EventDispatcher.ts        # single per-event listener, fans out to module event classes
        │   └── commandsConfig.ts         # command registration config
        ├── interfaces/         # ICommandHandler, IEventHandler, IContextMenuHandler, IHandler, message interfaces
        ├── services/           # generic presenter services (PermissionChecker)
        ├── commands/           # no-domain-logic commands (ping, pong, fetch-user…)
        ├── events/             # framework-level events (ClientReadyEvent, InteractionRouterEvent)
        ├── components/         # generic reusable interaction handlers
        └── messages/           # generic reply builders (SuccessMessage, ErrorMessage, AppErrorMessage)
```

Direction: `domain` knows nothing of `application` or `infrastructure`; `application` depends on `domain` and owns the repository/service interfaces; `infrastructure` implements those interfaces. Never import infrastructure from domain.

## DI conventions

- Tokens are **split per module**: each module owns a `<Feature>DiTypes.ts` (`Symbol.for(...)` values in an `as const` object) at its root. `src/di/DiTypes.ts` is just a thin aggregator that re-exports them (`{ shared, users, guild, groups, discord }`) — it defines no tokens and holds no bindings.
- **Shared** services are bound in `src/shared/SharedModule.ts` (a `ContainerModule`), against `SharedDiTypes` tokens.
- **Feature** services are bound in `src/modules/<feature>/<Feature>Module.ts` (a `ContainerModule`, at the module root — not in `infrastructure/`). Each module is loaded in `src/di/container.ts` via `container.load(SharedModule, UserModule, GuildModule, GroupModule, DiscordModule)`. The container is `new Container({ defaultScope: "Singleton" })`.
- Bind pattern: a service **fronted by an interface** gets a token in `<Feature>DiTypes.ts` / `SharedDiTypes.ts` and is bound via `.to()` (`bind<IGroupRepository>(GroupDiTypes.GroupRepository).to(PrismaGroupRepository)`, `bind<ILogger>(SharedDiTypes.Logger).to(ConsoleLogger)`). A concrete service with **no matching interface** needs no token — bind it to itself with `.toSelf()` and inject the class directly (e.g. `PrismaService`, `PrismaTransactionContext`, `PermissionChecker`, `CommandRegistry`, use cases).
- Constructor injection with decorators. `experimentalDecorators` + `emitDecoratorMetadata` are on; Biome's `unsafeParameterDecoratorsEnabled` is on.

When adding a feature:
1. Create `src/modules/<feature>/{domain,application,infrastructure}/`.
2. Create `src/modules/<feature>/<Feature>DiTypes.ts` (an `as const` of `Symbol.for(...)` tokens).
3. Create `src/modules/<feature>/<Feature>Module.ts` as a `new ContainerModule(({ bind }) => { … })`.
4. Load it in `container.load(...)` in `src/di/container.ts`, and add its tokens to the aggregator in `src/di/DiTypes.ts`.
5. If persisted: add model `*.prisma` files under `src/modules/<feature>/infrastructure/schemas/` and run `npm run prisma generate`.
6. Add bot presenter: create `src/modules/<feature>/presenter/discord/{commands,events,components,messages}/`. Bind commands/events/components to the shared multi-inject tokens (see below) — `CommandRegistry` / `EventDispatcher` in `src/shared/presenter/discord/bootstrap/` pick them up automatically via DI.

## Presenter conventions

> **Current state:** only the shared presenter (`src/shared/presenter/discord/`) is built out today. Per-module presenters are scaffolding (an empty `groups/presenter/discord/`); add them following the shape below.

- Per-module presenter code lives at `src/modules/<feature>/presenter/discord/`:
  - `commands/` — slash command definitions + handlers, implementing `ICommandHandler`
  - `events/` — event handler classes scoped to this feature (physically local to the module; dispatch is centralized, see below)
  - `components/` — feature-specific interaction handlers
  - `messages/` — feature reply builders (there are **no** embeds — use `messages/`)
  - `services/` — optional, only if the feature needs its own presenter-layer service
- Shared, reusable bot infra lives in `src/shared/presenter/discord/`:
  - `bootstrap/` — the composition root. `createDiscordClient.ts` builds the client; `CommandRegistry.ts` / `EventDispatcher.ts` wire up commands and events across all modules; `commandsConfig.ts` holds the registration config. This is the only place allowed to know the full picture (all registries, the client, login sequencing).
  - `interfaces/` — `ICommandHandler`, `IEventHandler`, `IContextMenuHandler`, `IHandler`, and the message interfaces (`IBaseMessage`, `IMessageResponse`, `IReplyResponse`, …). Modules implement these; interfaces don't know about bootstrap.
  - `services/` — generic presenter services (`PermissionChecker`).
  - `commands/`, `events/`, `components/`, `messages/` — generic, no-domain-logic equivalents (ping/pong/fetch-user commands, ClientReady/InteractionRouter events, generic components, SuccessMessage/ErrorMessage/AppErrorMessage).
- **Events**: there's exactly one real `client.on(...)` per Discord event name, driven by `EventDispatcher.ts`. Every feature's event class is bound to the shared `DiscordDiTypes.Event` multi-inject token; the dispatcher loops over the injected instances, filters by the event name each class declares, and calls `.execute()` on the matches. Event code stays physically owned by its module even though dispatch is centralized.
- **Components / interactions**: routed through the `InteractionRouterEvent`, which branches by interaction type (command/context-menu/button/select-menu/modal/autocomplete) and dispatches to the matching handler by `customId`. Handlers are bound to shared multi-inject tokens.
- **Autocomplete** is tightly coupled to its command, so it's an optional `autocomplete()` hook on the command class (or a sibling file next to it) — not its own component category.
- **Messages** (`SuccessMessage`, `ErrorMessage`, `AppErrorMessage`) are the reply builders — there are no `BaseEmbed`/embed classes. Keep them pure — no side effects.

## Code conventions

- **Imports: `@/` path alias only.** `@/*` resolves to `./src/*`. No relative imports (`./`, `../`) — anywhere, including same-folder. This is a hard rule.
- **TS extensions on imports.** `allowImportingTsExtensions` is on; write `import { X } from "@/foo/Bar.ts"` (note the `.ts`).
- **IDs**: use `IIdGenerator` (CUID2) via DI. Never roll your own.
- **Dates**: use `IDateProvider` via DI. Never call `new Date()` directly in application/domain code.
- **Logging**: use `ILogger` via DI.
- **Validation**: Zod at edges only (request DTOs, env config). Domain types don't re-validate.
- **Errors**: use `ResultType<T, E>` (`src/shared/kernel/types/ResultType.ts`) with the `okRes`/`errRes` helpers (`src/shared/kernel/lib/OkResult.ts` and `ErrResult.ts`) and `AppError` (`src/shared/kernel/errors/AppError.ts`). Don't throw across application boundaries.
- **Style**: Biome enforces — double quotes, organized imports, space indent. Don't fight it.
- **TS strictness**: TypeScript 7 enables the full `strict` family (`strictNullChecks`, `noImplicitAny`, `strictPropertyInitialization`, `useUnknownInCatchVariables`, etc.) **by default** — `tsconfig.json` has no `strict: true` and doesn't need one. On top of that it explicitly sets `noUnusedLocals` and `noFallthroughCasesInSwitch`. Don't add `strict: false` or per-flag opt-outs to route around this; keep edits clean under the default strictness.

## Testing

No test runner is wired up yet — there's no `vitest` dependency or `test` script on v2. When that lands:
- Colocate as `*.test.ts` next to the source file.
- Prefer testing application use cases against fakes/in-memory repos over end-to-end.
- Domain layer should be trivially testable — pure functions / pure objects.

## CI

`.github/workflows/ci.yaml` has two jobs on PR / push to `master`: `quality` runs `biome ci .` directly (via `biomejs/setup-biome`), `validation` runs `npm install -g npm@11`, `npm ci`, `npm run prisma generate`, then `npm run type-check`. Don't merge red.

## Don'ts

- Don't use relative imports — `@/` alias only.
- Don't put bindings or token definitions in `src/di/DiTypes.ts` — it's a pure aggregator. Feature services belong in the feature's `<Feature>Module.ts`, shared ones in `SharedModule.ts`; loading happens in `src/di/container.ts`.
- Don't invent a `check`/`check:fix` script — use `format`/`lint` directly. Don't use a single `--` to pass flags through npm (silently swallowed on this npm version) — use `---` (`npm run lint --- --write`).
- Don't add libraries when `shared/` already covers it (logger, date provider, ID provider, ResultType/AppError).
- Don't remove enabled `tsconfig.json` compiler options, add `strict: false`/per-flag strict opt-outs, or disable Biome rules per-file without a real reason.
- Don't introduce new top-level directories without asking.
- Don't write multi-paragraph JSDoc — names + types should carry meaning.
