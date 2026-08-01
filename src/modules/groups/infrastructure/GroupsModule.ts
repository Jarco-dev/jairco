import { ContainerModule } from "inversify";
import { DiTypes } from "@/di/DiTypes.ts";
import type { IGroupRepository } from "@/modules/groups/application/interfaces/IGroupRepository.ts";
import type { IRoleRepository } from "@/modules/groups/application/interfaces/IRoleRepository.ts";
import { PrismaGroupRepository } from "@/modules/groups/infrastructure/repositories/PrismaGroupRepository.ts";
import { PrismaRoleRepository } from "@/modules/groups/infrastructure/repositories/PrismaRoleRepository.ts";

export const GroupsModule = new ContainerModule(({ bind }) => {
  // Repositories
  bind<IGroupRepository>(DiTypes.GroupRepository).to(PrismaGroupRepository);
  bind<IRoleRepository>(DiTypes.RoleRepository).to(PrismaRoleRepository);
});
