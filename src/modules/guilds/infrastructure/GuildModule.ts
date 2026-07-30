import { ContainerModule } from "inversify";
import { DiTypes } from "@/di/DiTypes.ts";
import type { IGuildRepository } from "@/modules/guilds/application/interfaces/IGuildRepository.ts";
import { PrismaGuildRepository } from "@/modules/guilds/infrastructure/repositories/PrismaGuildRepository.ts";

export const GuildModule = new ContainerModule(({ bind }) => {
  // Repositories
  bind<IGuildRepository>(DiTypes.GuildRepository).to(PrismaGuildRepository);
});
