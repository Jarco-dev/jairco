import { ContainerModule } from "inversify";
import { DiTypes } from "@/di/DiTypes.ts";
import type { IUserRepository } from "@/modules/users/application/interfaces/IUserRepository.ts";
import { PrismaUserRepository } from "@/modules/users/infrastructure/repositories/PrismaUserRepository.ts";

export const UserModule = new ContainerModule(({ bind }) => {
  // Repositories
  bind<IUserRepository>(DiTypes.UserRepository).to(PrismaUserRepository);
});
