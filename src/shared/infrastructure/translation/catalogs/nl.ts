import type { TranslationCatalog } from "@/shared/application/interfaces/TranslationCatalog.ts";

export const nl: TranslationCatalog = {
  errors: {
    title: {
      ValidationFailed: "Er klopt iets niet aan je invoer",
      NotFound: "Ik kon niet vinden wat je zocht",
      Unauthorized:
        "Je hebt niet de rechten die nodig zijn om dit te kunnen doen",
      Conflict: "Dat conflicteert met iets dat al bestaat",
      InternalError: "Er ging iets mis, probeer het alstublieft nog een keer",
    },
  },
  shared: {
    guildOnlyError: "Dit is niet beschikbaar buiten servers",
  },
  commands: {
    ping: {
      result: {
        title: "Ping resultaat",
        description: "💟 Hartslag: {{heartbeat}}",
      },
      explanation: {
        title: "Ping uitleg",
        description:
          "💟 Hartslag: De connectie tussen de bot en de discord api servers",
      },
    },
  },
};
