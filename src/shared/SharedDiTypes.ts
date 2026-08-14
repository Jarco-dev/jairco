export const SharedDiTypes = {
  Logger: Symbol.for("Logger"),
  DatabaseTransactionManager: Symbol.for("DatabaseTransactionManager"),
  IdGenerator: Symbol.for("IdGenerator"),
  DateProvider: Symbol.for("DateProvider"),
} as const;
