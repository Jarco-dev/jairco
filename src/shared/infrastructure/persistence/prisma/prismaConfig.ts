import "dotenv/config";
import { defineConfig } from "prisma/config";

// Note that this can't use env via DI because it also runs using console commands
const {
  POSTGRES_DATABASE,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_SHADOW_DATABASE,
  POSTGRES_SHADOW_HOST,
  POSTGRES_SHADOW_PASSWORD,
  POSTGRES_SHADOW_PORT,
  POSTGRES_SHADOW_USER,
  POSTGRES_USER,
} = process.env;

export const DB_STRING = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DATABASE}`;
export const SHADOW_DB_STRING = `postgres://${POSTGRES_SHADOW_USER}:${POSTGRES_SHADOW_PASSWORD}@${POSTGRES_SHADOW_HOST}:${POSTGRES_SHADOW_PORT}/${POSTGRES_SHADOW_DATABASE}`;

// TODO: Create migration(s)
export default defineConfig({
  datasource: {
    shadowDatabaseUrl: SHADOW_DB_STRING,
    url: DB_STRING,
  },
  migrations: {
    path: "./migrations",
  },
  schema: "../../../../",
});
