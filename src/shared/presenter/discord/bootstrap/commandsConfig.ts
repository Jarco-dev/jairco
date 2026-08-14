import { SlashCommandBuilder } from "discord.js";
import { PingCommand } from "@/shared/presenter/discord/commands/PingCommand.ts";
import type { ICommandsConfig } from "@/shared/presenter/discord/interfaces/ICommandsConfig.ts";

export const commandsConfig: ICommandsConfig = [
  {
    builder: new SlashCommandBuilder()
      .setName("utils")
      .setDescription("Generic utilities"),
    subcommands: [PingCommand],
  },
];
