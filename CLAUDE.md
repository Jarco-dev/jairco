# jairco

The jairco discord bot.

Active branch: `v2` — full overhaul: new modular architecture. PR base: `master`.

## Tech stack

- Node `^22.13.0`, TypeScript `^6.0.2` (strict)
- Backend: Inversify 8 (DI), Prisma 7 + Postgres, Zod 4
- Discord: discord.js ^14
- Tooling: Biome 2.4 (lint + format), CUID2 for IDs

## Commands

| Command | What |
| --- | --- |
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm run type-check` | `tsc --noEmit` |
| `npm run check` | Biome lint + format (read-only) |
| `npm run check --- --fix` | Biome auto-fix — **triple-dash required** |
| `npm run test` | Vitest |
| `npm run prisma --- <args>` | Prisma CLI (custom config) — **triple-dash required** |

**Triple-dash rule:** several scripts wrap another tool (`biome`, `prisma`). To pass flags through, use `---`, not `--`. npm strips one separator on its way through the wrapper. So `npm run check --- --fix`, `npm run prisma --- generate`, etc. Do **not** use `npm run check -- --fix` or invent a `check:fix` script.

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
│   └── presenter/discord/  # discord.js presenter for this feature
│       ├── commands/       # Slash command definitions + handlers
│       ├── events/         # discord.js client event listeners scoped to this feature
│       ├── components/     # Button/modal/select-menu interaction handlers
│       └── mappers/        # View-model mappers (domain/app → embed/message shape)
└── shared/                 # cross-cutting building blocks
    ├── application/        # interfaces: ILogger, IDateProvider, IIdGenerator, …
    ├── infrastructure/     # Prisma service, NodeDateProvider, Cuid2IdGenerator, ConsoleLogger, …
    ├── kernel/             # Result / error / value-object base types
    └── presenter/discord/  # Shared bot infra: client, command/event registration, shared embeds
        ├── components/     # Reusable interaction handlers (buttons/modals/selects)
        ├── client.ts       # discord.js Client instance + login
        └── registry.ts     # Command/event registration across modules
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
5. If persisted: add models to `src/shared/infrastructure/persistence/prisma/schema.prisma` and run `npm run prisma --- generate`.
6. Add bot presenter: create `src/modules/<feature>/presenter/discord/{commands,events,components,mappers}/` and register the feature's commands/events via `src/shared/presenter/discord/registry.ts`.

## Presenter conventions

- Presenter code lives at `src/modules/<feature>/presenter/discord/` — four subfolders:
  - `commands/` — slash command definitions + handlers (`data` + `execute`)
  - `events/` — discord.js client event listeners scoped to this feature
  - `components/` — button/modal/select-menu interaction handlers
  - `mappers/` — pure functions that map domain/application types to embed/message payloads
- Shared, reusable bot infra lives in `src/shared/presenter/discord/` — client setup, command/event registration, shared embed builders, interaction routing.
- Mappers are pure functions — no DI, no side effects. Keep them thin.

## Code conventions

- **Imports: `@/` path alias only.** `@/*` resolves to `./src/*`. No relative imports (`./`, `../`) — anywhere, including same-folder. This is a hard rule.
- **TS extensions on imports.** `allowImportingTsExtensions` is on; write `import { X } from "@/foo/Bar.ts"` (note the `.ts`).
- **IDs**: use `IIdGenerator` (CUID2) via DI. Never roll your own.
- **Dates**: use `IDateProvider` via DI. Never call `new Date()` directly in application/domain code.
- **Logging**: use `ILogger` via DI.
- **Validation**: Zod at edges only (request DTOs, env config). Domain types don't re-validate.
- **Errors**: use the `Result` / error base types in `src/shared/kernel/`. Don't throw across application boundaries.
- **Style**: Biome enforces — double quotes, organized imports, space indent. Don't fight it.
- **TS strictness**: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports` all on. Keep edits clean.

## Testing

Vitest is configured but **no tests exist yet on v2**. When adding tests:
- Colocate as `*.test.ts` next to the source file.
- Prefer testing application use cases against fakes/in-memory repos over end-to-end.
- Domain layer should be trivially testable — pure functions / pure objects.

## CI

`.github/workflows/ci.yaml` runs `npm run check` and `npm run type-check` on PR / push to `master`. Don't merge red.

## Don'ts

- Don't use relative imports — `@/` alias only.
- Don't bind feature services in `src/di/container.ts` — they belong in the feature's `<Feature>Module.ts`.
- Don't run `npm run check --fix` or `npm run prisma generate` — flags need the triple-dash form.
- Don't add libraries when `shared/` already covers it (logger, date provider, ID provider, Result types).
- Don't downgrade TS strictness or disable Biome rules per-file without a real reason.
- Don't introduce new top-level directories without asking.
- Don't write multi-paragraph JSDoc — names + types should carry meaning.
