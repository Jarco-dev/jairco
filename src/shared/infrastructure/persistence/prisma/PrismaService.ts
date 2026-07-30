import { PrismaPg } from "@prisma/adapter-pg";
import { injectable } from "inversify";
import {
  Prisma,
  PrismaClient,
} from "@/shared/infrastructure/persistence/prisma/.generated/client.ts";
import { DB_STRING } from "@/shared/infrastructure/persistence/prisma/prismaConfig.ts";
import type { PrismaTypes } from "@/shared/infrastructure/persistence/prisma/types/PrismaTypes.ts";

@injectable()
export class PrismaService {
  public prisma: PrismaTypes.PrismaClient;
  static skipField = Prisma.skip;

  constructor() {
    const adapter = new PrismaPg({ connectionString: DB_STRING });
    this.prisma = new PrismaClient({ adapter });
  }

  async connect(): Promise<void> {
    await this.prisma.$connect();
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  getRepository<T extends Uncapitalize<PrismaTypes.Prisma.ModelName>>(
    model: T,
  ): PrismaTypes.PrismaClient[T] {
    return this.prisma[model];
  }
}
