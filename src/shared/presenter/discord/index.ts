import "reflect-metadata";
import "dotenv/config";
import type { Client } from "discord.js";
import { container } from "@/di/container.ts";
import { DiTypes } from "@/di/DiTypes.ts";
import type { Logger } from "@/shared/application/interfaces/Logger.ts";
import { env } from "@/shared/infrastructure/config/env.ts";
import { PrismaService } from "@/shared/infrastructure/persistence/prisma/PrismaService.ts";
import { EventDispatcher } from "@/shared/presenter/discord/bootstrap/EventDispatcher.ts";

async function bootstrap(): Promise<void> {
  const logger = container.get<Logger>(DiTypes.shared.Logger);

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception in process#uncaughtException", { error });
  });

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled rejection in process#unhandledRejection", {
      reason,
    });
  });

  const prisma = container.get<PrismaService>(PrismaService);
  prisma.client
    .$connect()
    .catch((error) =>
      logger.error("[Bootstrap] Error while connecting to database", { error }),
    );

  const client = container.get<Client>(DiTypes.discord.Client);
  const eventDispatcher = container.get<EventDispatcher>(EventDispatcher);

  eventDispatcher.attachHandlers();

  logger.info("[Bootstrap] Connecting to discord...");
  await client.login(env.DISCORD_BOT_TOKEN);
}

bootstrap().catch((error) => {
  console.error("Error during bootstrap:", error);
  process.exit(1);
});
