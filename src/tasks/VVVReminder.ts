import { TimerTaskResult } from "@/types";
import { Task } from "@/structures";
import { ChannelType } from "discord.js";

export default class VVVReminderTask extends Task {
    constructor() {
        super({
            name: "VVVReminder",
            cronExpression: "0 12 * * *"
        });
    }

    async run(): Promise<TimerTaskResult> {
        const guild = await this.client.guilds.fetch(
            this.client.sConfig.VVV_GUILD_ID
        );
        if (!guild) throw new Error("Guild not found");

        const channel = await guild.channels.fetch(
            this.client.sConfig.VVV_CHANNEL_ID
        );
        if (!channel || channel.type !== ChannelType.GuildText)
            throw new Error("Channel not found");

        channel.send(
            `${this.client.sConfig.VVV_MESSAGE}\n\n<@&${this.client.sConfig.VVV_ROLE_ID}>`
        );

        // Success
        return { result: "SUCCESS" };
    }
}
