import { HandlerResult } from "@/types";
import { EventHandler } from "@/structures";
import { Message } from "discord.js";

export default class MessageUpdateEventHandler extends EventHandler<"messageUpdate"> {
    constructor() {
        super({
            name: "messageUpdate"
        });
    }

    public run(
        oldMsg: Message,
        newMsg: Message
    ): HandlerResult | Promise<HandlerResult> {
        try {
            return this.runCounting(oldMsg, newMsg);
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
        oldMsg: Message,
        newMsg: Message
    ): Promise<HandlerResult> {
        if (newMsg.author.bot || !newMsg.inGuild())
            return {
                result: "OTHER",
                note: "Message is from bot or not in guild"
            };

        const settings = await this.client.cacheableData.getCountingSettings(
            newMsg.guild.id
        );
        if (!settings?.countingEnabled) {
            return { result: "FEATURE_DISABLED" };
        }
        if (!settings.countingChannel) {
            return { result: "OTHER", note: "Counting channel not set" };
        }
        if (settings.countingChannel !== newMsg.channel.id) {
            return { result: "OTHER", note: "Not in counting channel" };
        }
        if (
            !newMsg.reactions.cache
                .get("✅")
                ?.users.cache.has(this.client.user!.id)
        ) {
            return {
                result: "OTHER",
                note: "Message was not a validated count"
            };
        }

        const regex = /^[0-9]+/;
        const oldCount = regex.test(oldMsg.content)
            ? parseInt(regex.exec(oldMsg.content)![0])
            : undefined;
        const newCount = regex.test(newMsg.content)
            ? parseInt(regex.exec(newMsg.content)![0])
            : undefined;
        if (oldCount === newCount) {
            return { result: "OTHER", note: "Number is still present" };
        }

        const blacklist = await this.client.cacheableData.getBlacklist(
            "counting",
            newMsg.guild.id,
            newMsg.author.id
        );
        if (blacklist) {
            return { result: "OTHER", note: "User already blacklisted" };
        }

        await this.client.prisma.blacklists.create({
            data: {
                type: "COUNTING",
                guildIdUserIdType:
                    newMsg.guild.id + newMsg.author.id + "COUNTING",
                reason: "Edited a validated count",
                Guild: { connect: { discordId: newMsg.guild.id } },
                ReceivedByUser: {
                    connectOrCreate: {
                        where: { discordId: newMsg.author.id },
                        create: {
                            discordId: newMsg.author.id,
                            Guilds: {
                                connect: { discordId: newMsg.guild.id }
                            }
                        }
                    }
                },
                GivenByUser: {
                    connectOrCreate: {
                        where: { discordId: this.client.user!.id },
                        create: {
                            discordId: this.client.user!.id,
                            Guilds: {
                                connect: { discordId: newMsg.guild.id }
                            }
                        }
                    }
                }
            }
        });

        const embed = this.client.lang.getEmbed(
            this.client.lang.default,
            "counting.validatedCountEditedEmbed",
            {
                user: newMsg.author.toString(),
                currentCount: (settings.currentCount ?? 0).toString(),
                nextCount: ((settings.currentCount ?? 0) + 1).toString()
            }
        );
        this.client.sender.msgChannel(newMsg.channel, { embeds: [embed] });

        return { result: "SUCCESS" };
    }
}
