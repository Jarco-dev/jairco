import { HandlerResult } from "@/types";
import { GuildMember } from "discord.js";
import { EventHandler } from "@/structures";

export default class GuildMemberAddEventHandler extends EventHandler<"guildMemberAdd"> {
    constructor() {
        super({
            name: "guildMemberAdd"
        });
    }

    public async run(member: GuildMember): Promise<HandlerResult> {
        // Welcome
        try {
            const settings = await this.client.cacheableData.getWelcomeSettings(
                member.guild.id
            );
            if (
                !settings ||
                !settings.welcomeEnabled ||
                !settings.welcomeChannel ||
                !settings.welcomeMessage
            ) {
                return {
                    result: "OTHER",
                    note: "Disabled or not fully configured"
                };
            }

            const channel = await member.guild.channels.fetch(
                settings.welcomeChannel
            );
            if (!channel || !channel.isTextBased()) {
                return {
                    result: "OTHER",
                    note: "No channel found or not a text channel"
                };
            }

            const msg = settings.welcomeMessage.replace(
                /{{user}}/g,
                `${member}`
            );
            channel.send(msg);
        } catch (err: any) {
            this.client.logger.error(
                "Error while handling guild member add",
                err
            );
            return {
                result: "ERRORED",
                note: "Error while handling guild member add",
                error: err
            };
        }

        // Success
        return { result: "SUCCESS" };
    }
}
