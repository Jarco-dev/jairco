import { HandlerResult } from "@/types";
import { ChatInputCommand } from "@/structures";
import {ChatInputCommandInteraction, Collection, Guild, GuildBan, SlashCommandBuilder} from "discord.js";

async function fetchAllBans(
    guild: Guild,
    after?: string,
    bans: Collection<string, GuildBan> = new Collection()
): Promise<Collection<string, GuildBan>> {
    const batch = await guild.bans.fetch({
        limit: 1000,
        after
    });

    // Merge this batch
    for (const [id, ban] of batch) {
        bans.set(id, ban);
    }

    // If we got less than 1000, we're done
    if (batch.size < 1000) {
        return bans;
    }

    // Continue after the last user ID we received
    const lastId = batch.lastKey();

    if (!lastId) {
        return bans;
    }

    return fetchAllBans(guild, lastId, bans);
}

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

        await i.deferReply();

        const bans = await fetchAllBans(i.guild!);
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
