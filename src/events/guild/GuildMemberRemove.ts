import { EventHandler } from "@/structures";
import { GuildMember, PartialGuildMember } from "discord.js";
import { HandlerResult } from "@/types";

export default class GuildMemberRemoveEventHandler extends EventHandler<"guildMemberRemove"> {
    constructor() {
        super({
            name: "guildMemberRemove"
        });
    }

    public async run(
        member: GuildMember | PartialGuildMember
    ): Promise<HandlerResult> {
        try {
            await this.client.prisma.users.update({
                where: { discordId: member.id },
                data: {
                    Groups: {
                        set: []
                    }
                }
            });
        } catch (err: any) {
            this.client.logger.error(
                "Error while handling guild member remove",
                err
            );
            return {
                result: "ERRORED",
                note: "Error while handling guild member remove",
                error: err
            };
        }

        return { result: "SUCCESS" };
    }
}
