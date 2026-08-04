import { ContainerModule } from "inversify";
import type { IGroupRepository } from "@/modules/groups/application/interfaces/IGroupRepository.ts";
import type { IRoleRepository } from "@/modules/groups/application/interfaces/IRoleRepository.ts";
import { PrismaGroupRepository } from "@/modules/groups/infrastructure/repositories/PrismaGroupRepository.ts";
import { PrismaRoleRepository } from "@/modules/groups/infrastructure/repositories/PrismaRoleRepository.ts";

export const GroupDiTypes = {
  GroupRepository: Symbol.for("GroupRepository"),
  RoleRepository: Symbol.for("RoleRepository"),
} as const;

export const GroupModule = new ContainerModule(({ bind }) => {
  // Repositories
  bind<IGroupRepository>(GroupDiTypes.GroupRepository).to(
    PrismaGroupRepository,
  );
  bind<IRoleRepository>(GroupDiTypes.RoleRepository).to(PrismaRoleRepository);
});
