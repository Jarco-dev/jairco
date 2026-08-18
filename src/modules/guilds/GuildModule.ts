import { ContainerModule } from "inversify";
import type { GuildRepository } from "@/modules/guilds/application/interfaces/GuildRepository.ts";
import { GuildDiTypes } from "@/modules/guilds/GuildDiTypes.ts";
import { PrismaGuildRepository } from "@/modules/guilds/infrastructure/repositories/PrismaGuildRepository.ts";

export const GuildModule = new ContainerModule(({ bind }) => {
  // Repositories
  bind<GuildRepository>(GuildDiTypes.GuildRepository).to(PrismaGuildRepository);
});
