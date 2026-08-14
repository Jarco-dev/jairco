import { ContainerModule } from "inversify";
import type { IUserRepository } from "@/modules/users/application/interfaces/IUserRepository.ts";
import { PrismaUserRepository } from "@/modules/users/infrastructure/repositories/PrismaUserRepository.ts";
import { UserDiTypes } from "@/modules/users/UserDiTypes.ts";

export const UserModule = new ContainerModule(({ bind }) => {
  // Repositories
  bind<IUserRepository>(UserDiTypes.UserRepository).to(PrismaUserRepository);
});
