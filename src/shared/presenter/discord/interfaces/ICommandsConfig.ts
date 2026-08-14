import type {
  SlashCommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from "discord.js";
import type { ICommandHandler } from "@/shared/presenter/discord/interfaces/ICommandHandler.ts";

export type SubCommand = new (...args: never[]) => ICommandHandler;

export interface CommandWithSubCommands {
  builder: SlashCommandBuilder;
  subcommands: SubCommand[];
}

export interface CommandWithGroups {
  builder: SlashCommandBuilder;
  groups: {
    builder: SlashCommandSubcommandGroupBuilder;
    subcommands: SubCommand[];
  }[];
}

export type CommandWithGroupsAndSubCommands = CommandWithSubCommands &
  CommandWithGroups;

export type CommandTreeNode =
  | CommandWithSubCommands
  | CommandWithGroups
  | CommandWithGroupsAndSubCommands;

export type ICommandsConfig = CommandTreeNode[];
