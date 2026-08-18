import { SlashCommandBuilder } from "discord.js";
import { PingCommand } from "@/shared/presenter/discord/commands/PingCommand.ts";
import type { CommandsConfig } from "@/shared/presenter/discord/interfaces/CommandsConfig.ts";

export const commandsConfig: CommandsConfig = [
  {
    builder: new SlashCommandBuilder()
      .setName("utils")
      .setDescription("Generic utilities"),
    subcommands: [PingCommand],
  },
];
