import { ContainerModule } from "inversify";
import type { IGuildRepository } from "@/modules/guilds/application/interfaces/IGuildRepository.ts";
import { GuildDiTypes } from "@/modules/guilds/GuildDiTypes.ts";
import { PrismaGuildRepository } from "@/modules/guilds/infrastructure/repositories/PrismaGuildRepository.ts";

export const GuildModule = new ContainerModule(({ bind }) => {
  // Repositories
  bind<IGuildRepository>(GuildDiTypes.GuildRepository).to(
    PrismaGuildRepository,
  );
});
