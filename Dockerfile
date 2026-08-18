FROM node:22.13.0-alpine AS base

WORKDIR /usr/src/app

FROM base AS deps

COPY package*.json ./

RUN npm ci

FROM base AS development

COPY --from=deps --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --chown=node:node package*.json tsconfig.json ./

USER node

# src/ is bind-mounted, so the client is generated at start rather than baked in
CMD ["sh", "-c", "npm run prisma --- generate && npm run prisma --- migrate deploy && exec npm run dev"]

FROM deps AS build

COPY tsconfig.json ./
COPY ./src ./src

RUN npm run prisma --- generate
RUN npm run build

FROM base AS production

ENV NODE_ENV=production

COPY --chown=node:node package*.json ./
COPY --from=deps --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=node:node /usr/src/app/dist ./dist
COPY --from=build --chown=node:node /usr/src/app/src/shared/infrastructure/persistence/prisma/schema.prisma ./src/shared/infrastructure/persistence/prisma/schema.prisma
COPY --from=build --chown=node:node /usr/src/app/src/shared/infrastructure/persistence/prisma/migrations ./src/shared/infrastructure/persistence/prisma/migrations
COPY --from=build --chown=node:node /usr/src/app/src/shared/infrastructure/persistence/prisma/prismaConfig.ts ./src/shared/infrastructure/persistence/prisma/prismaConfig.ts

USER node

# exec form + `exec` so node replaces the shell and actually receives SIGTERM,
# which src/index.ts uses to shut down the client and Prisma cleanly
CMD ["sh", "-c", "npm run prisma --- migrate deploy && exec node ./dist/index.js"]
