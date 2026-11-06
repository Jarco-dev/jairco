import type { TranslationCatalog } from "@/shared/application/interfaces/TranslationCatalog.ts";

export const enUS: TranslationCatalog = {
  errors: {
    title: {
      ValidationFailed: "Something about your input wasn't valid",
      NotFound: "I couldn't find what you were looking for",
      Unauthorized: "You don't have the permissions required to do this",
      Conflict: "That conflicts with something that already exists",
      InternalError: "Something went wrong, please try again",
    },
  },
  commands: {
    ping: {
      result: {
        title: "Ping result",
        description: "💟 Heartbeat: {{heartbeat}}ms",
      },
      explanation: {
        title: "Ping explanation",
        description:
          "💟 Heartbeat: Heartbeat: The delay between the bot and the discord api servers",
      },
    },
  },
};
