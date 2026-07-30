export const DiTypes = {
  // Shared
  Logger: Symbol.for("Logger"),
  PrismaService: Symbol.for("PrismaService"),
  DatabaseTransactionManager: Symbol.for("DatabaseTransactionManager"),
  IdGenerator: Symbol.for("IdGenerator"),
  DateProvider: Symbol.for("DateProvider"),

  // Users
  UserRepository: Symbol.for("UserRepository"),

  // Guilds
  GuildRepository: Symbol.for("GuildRepository"),
};
