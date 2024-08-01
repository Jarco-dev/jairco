import { HandlerResult } from "@/types";
import { EventHandler } from "@/structures";
import { MessageReaction, User } from "discord.js";

export default class MessageReactionAddEventHandler extends EventHandler<"messageReactionAdd"> {
    constructor() {
        super({
            name: "messageReactionAdd"
        });
    }

    public run(
        reaction: MessageReaction,
        user: User
    ): HandlerResult | Promise<HandlerResult> {
        try {
            return this.runCounting(reaction, user);
        } catch (err: any) {
            this.client.logger.error(
                "Error while handling message for counting",
                err
            );
            return {
                result: "ERRORED",
                note: "Error while handling interaction in interactionLoader",
                error: err
            };
        }
    }

    private async runCounting(
        reaction: MessageReaction,
        user: User
    ): Promise<HandlerResult> {
        if (
            !reaction.message.guild ||
            !["✅", "❌"].includes(reaction.emoji.toString()) ||
            reaction.me ||
            user.id === this.client.user!.id
        ) {
            return {
                result: "OTHER",
                note: "Not in guild, emoji not relevant, reaction is from or by bot"
            };
        }

        const settings = await this.client.cacheableData.getCountingSettings(
            reaction.message.guild.id
        );
        if (!settings?.countingEnabled) {
            return { result: "FEATURE_DISABLED" };
        }
        if (!settings.countingChannel) {
            return { result: "OTHER", note: "Counting channel not set" };
        }
        if (settings.countingChannel !== reaction.message.channel.id) {
            return { result: "OTHER", note: "Not in counting channel" };
        }

        reaction.users.remove(user).catch(() => {});

        return { result: "SUCCESS" };
    }
}
