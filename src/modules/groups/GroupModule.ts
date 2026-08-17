import { ContainerModule } from "inversify";
import type { GroupRepository } from "@/modules/groups/application/interfaces/GroupRepository.ts";
import type { RoleRepository } from "@/modules/groups/application/interfaces/RoleRepository.ts";
import { CheckPermissionsUseCase } from "@/modules/groups/application/usecases/CheckPermissionsUseCase.ts";
import { GroupDiTypes } from "@/modules/groups/GroupDiTypes.ts";
import { PrismaGroupRepository } from "@/modules/groups/infrastructure/repositories/PrismaGroupRepository.ts";
import { PrismaRoleRepository } from "@/modules/groups/infrastructure/repositories/PrismaRoleRepository.ts";

export const GroupModule = new ContainerModule(({ bind }) => {
  // Repositories
  bind<GroupRepository>(GroupDiTypes.GroupRepository).to(PrismaGroupRepository);
  bind<RoleRepository>(GroupDiTypes.RoleRepository).to(PrismaRoleRepository);

  // Use cases
  bind(CheckPermissionsUseCase).toSelf();
});
