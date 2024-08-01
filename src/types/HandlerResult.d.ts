export type HandlerResult =
    | {
          result:
              | "SUCCESS"
              | "INVALID_ARGUMENTS"
              | "USER_MISSING_PERMISSIONS"
              | "ACTION_EXPIRED"
              | "FEATURE_DISABLED"
              | "OTHER";
          note?: string;
      }
    | {
          result: "ERRORED";
          note: string;
          error: Error;
      };
