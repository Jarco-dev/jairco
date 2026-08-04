import { ContainerModule } from "inversify";
import type { IGuildRepository } from "@/modules/guilds/application/interfaces/IGuildRepository.ts";
import { PrismaGuildRepository } from "@/modules/guilds/infrastructure/repositories/PrismaGuildRepository.ts";

export const GuildDiTypes = {
  GuildRepository: Symbol.for("GuildRepository"),
} as const;

export const GuildModule = new ContainerModule(({ bind }) => {
  // Repositories
  bind<IGuildRepository>(GuildDiTypes.GuildRepository).to(
    PrismaGuildRepository,
  );
});
