import { ContainerModule } from "inversify";
import type { UserRepository } from "@/modules/users/application/interfaces/UserRepository.ts";
import { PrismaUserRepository } from "@/modules/users/infrastructure/repositories/PrismaUserRepository.ts";
import { UserDiTypes } from "@/modules/users/UserDiTypes.ts";

export const UserModule = new ContainerModule(({ bind }) => {
  // Repositories
  bind<UserRepository>(UserDiTypes.UserRepository).to(PrismaUserRepository);
});
