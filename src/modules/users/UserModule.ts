import { ContainerModule } from "inversify";
import type { IUserRepository } from "@/modules/users/application/interfaces/IUserRepository.ts";
import { PrismaUserRepository } from "@/modules/users/infrastructure/repositories/PrismaUserRepository.ts";

export const UserDiTypes = {
  UserRepository: Symbol.for("UserRepository"),
} as const;

export const UserModule = new ContainerModule(({ bind }) => {
  // Repositories
  bind<IUserRepository>(UserDiTypes.UserRepository).to(PrismaUserRepository);
});
