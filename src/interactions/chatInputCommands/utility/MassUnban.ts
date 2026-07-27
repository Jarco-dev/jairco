import { HandlerResult } from "@/types";
import { ChatInputCommand } from "@/structures";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default class MassUnbanChatInputCommand extends ChatInputCommand {
    constructor() {
        super({
            builder: new SlashCommandBuilder()
                .setName("mass-unban")
                .setDescription("Unban every single member in the guild")
                .setDMPermission(false)
        });
    }

    public async run(i: ChatInputCommandInteraction): Promise<HandlerResult> {
        if (i.user.id !== "232163746829697025") {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const bans = await i.guild!.bans.fetch();
        this.client.sender.reply(
            i,
            { content: `Unbanning ${bans.size} members` },
            { msgType: "SUCCESS" }
        );

        let unbanned = 0;
        for (const ban of bans.values()) {
            i.guild!.bans.remove(ban.user.id);
            unbanned++;
            this.client.logger.info(
                `Status: ${unbanned}/${bans.size}, unbanned ${ban.user.username}`
            );
        }

        this.client.sender.msgChannel(
            i.channelId,
            { content: `All ${bans.size} unbans have been completed!` },
            { msgType: "SUCCESS" }
        );

        // Success
        return { result: "SUCCESS" };
    }
}
