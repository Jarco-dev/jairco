export const DiscordDiTypes = {
  Client: Symbol.for("DiscordClient"),
  Command: Symbol.for("CommandHandler"),
  ContextMenu: Symbol.for("ContextMenuHandler"),
  Event: Symbol.for("EventHandler"),
} as const;
