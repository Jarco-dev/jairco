import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  // Discord
  DISCORD_BOT_TOKEN: z.string().min(1),

  // Postgres
  POSTGRES_HOST: z.string().min(1),
  POSTGRES_PORT: z.coerce.number().int().positive(),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_DATABASE: z.string().min(1),

  // Postgres shadow
  POSTGRES_SHADOW_HOST: z.string().min(1).optional(),
  POSTGRES_SHADOW_PORT: z.coerce.number().int().positive().optional(),
  POSTGRES_SHADOW_USER: z.string().min(1).optional(),
  POSTGRES_SHADOW_PASSWORD: z.string().min(1).optional(),
  POSTGRES_SHADOW_DATABASE: z.string().min(1).optional(),

  // Miscellaneous
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["VERBOSE", "DEBUG", "INFO", "WARN", "ERROR"])
    .default("INFO"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const keys = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
  throw new Error(`Invalid environment configuration. Check: ${keys}`);
}

export const env = parsed.data;
