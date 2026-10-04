import { HandlerResult } from "@/types";
import { ChatInputCommand } from "@/structures";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BotPermissionsBitField } from "@/classes";

export default class BanCountChatInputCommand extends ChatInputCommand {
    constructor() {
        super({
            builder: new SlashCommandBuilder()
                .setName("ban-count")
                .setNameLocalization("nl", "ban-aantal")
                .setDescription("Get amount of bans in the server")
                .setDescriptionLocalization(
                    "nl",
                    "Zie het totaal aantal bans in de server"
                )
                .setDMPermission(false)
        });
    }

    public async run(i: ChatInputCommandInteraction): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (!permissions.has(BotPermissionsBitField.Flags.Moderation)) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        await i.deferReply();
        const bans = await this.client.utils.fetchAllBans(i.guild!);
        this.client.sender.reply(
            i,
            {},
            {
                langLocation: "moderation.banCount",
                langVariables: { count: bans.size.toString() },
                msgType: "SUCCESS",
                method: "EDIT_REPLY"
            }
        );

        // Success
        return { result: "SUCCESS" };
    }
}
