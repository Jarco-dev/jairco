import { HandlerResult } from "@/types";
import { EventHandler } from "@/structures";
import { Message } from "discord.js";

export default class MessageDeleteEventHandler extends EventHandler<"messageDelete"> {
    constructor() {
        super({
            name: "messageDelete"
        });
    }

    public async run(msg: Message): Promise<HandlerResult> {
        try {
            this.runCounting(msg);
        } catch (err: any) {
            this.client.logger.error(
                "Error while handling message for counting",
                err
            );
        }

        try {
            this.runWordSnake(msg);
        } catch (err: any) {
            this.client.logger.error(
                "Error while handling message for word snake",
                err
            );
        }

        return { result: "SUCCESS" };
    }

    private async runCounting(msg: Message): Promise<HandlerResult> {
        if (msg.author.bot || !msg.inGuild())
            return {
                result: "OTHER",
                note: "Message is from bot or not in guild"
            };

        const settings = await this.client.cacheableData.getCountingSettings(
            msg.guild.id
        );
        if (!settings?.countingEnabled) {
            return { result: "FEATURE_DISABLED" };
        }
        if (!settings.countingChannel) {
            return { result: "OTHER", note: "Counting channel not set" };
        }
        if (settings.countingChannel !== msg.channel.id) {
            return { result: "OTHER", note: "Not in counting channel" };
        }
        if (
            !msg.reactions.cache
                .get("✅")
                ?.users.cache.has(this.client.user!.id)
        ) {
            return {
                result: "OTHER",
                note: "Message was not a validated count"
            };
        }

        const blacklist = await this.client.cacheableData.getBlacklist(
            "counting",
            msg.guild.id,
            msg.author.id
        );
        if (!blacklist) {
            await this.client.prisma.blacklists.create({
                data: {
                    type: "COUNTING",
                    guildIdUserIdType:
                        msg.guild.id + msg.author.id + "COUNTING",
                    reason: "Deleted a validated count",
                    Guild: { connect: { discordId: msg.guild.id } },
                    ReceivedByUser: {
                        connectOrCreate: {
                            where: { discordId: msg.author.id },
                            create: {
                                discordId: msg.author.id,
                                Guilds: {
                                    connect: { discordId: msg.guild.id }
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
                                    connect: { discordId: msg.guild.id }
                                }
                            }
                        }
                    }
                }
            });
        }

        const embed = this.client.lang.getEmbed(
            this.client.lang.default,
            "counting.validatedCountDeletedEmbed",
            {
                user: msg.author.toString(),
                currentCount: (settings.currentCount ?? 0).toString(),
                nextCount: ((settings.currentCount ?? 0) + 1).toString()
            }
        );
        this.client.sender.msgChannel(msg.channel, { embeds: [embed] });

        return { result: "SUCCESS" };
    }

    private async runWordSnake(msg: Message): Promise<HandlerResult> {
        if (msg.author.bot || !msg.inGuild())
            return {
                result: "OTHER",
                note: "Message is from bot or not in guild"
            };

        const settings = await this.client.cacheableData.getWordSnakeSettings(
            msg.guild.id
        );
        if (!settings?.wordSnakeEnabled) {
            return { result: "FEATURE_DISABLED" };
        }
        if (!settings.wordSnakeChannel) {
            return { result: "OTHER", note: "Word snake channel not set" };
        }
        if (settings.wordSnakeChannel !== msg.channel.id) {
            return { result: "OTHER", note: "Not in word snake channel" };
        }
        if (
            !msg.reactions.cache
                .get("✅")
                ?.users.cache.has(this.client.user!.id)
        ) {
            return {
                result: "OTHER",
                note: "Message was not a validated word"
            };
        }

        const blacklist = await this.client.cacheableData.getBlacklist(
            "wordsnake",
            msg.guild.id,
            msg.author.id
        );
        if (!blacklist) {
            await this.client.prisma.blacklists.create({
                data: {
                    type: "WORD_SNAKE",
                    guildIdUserIdType:
                        msg.guild.id + msg.author.id + "WORD_SNAKE",
                    reason: "Deleted a validated word",
                    Guild: { connect: { discordId: msg.guild.id } },
                    ReceivedByUser: {
                        connectOrCreate: {
                            where: { discordId: msg.author.id },
                            create: {
                                discordId: msg.author.id,
                                Guilds: {
                                    connect: { discordId: msg.guild.id }
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
                                    connect: { discordId: msg.guild.id }
                                }
                            }
                        }
                    }
                }
            });
        }

        const embed = this.client.lang.getEmbed(
            this.client.lang.default,
            "wordSnake.validatedWordDeletedEmbed",
            {
                user: msg.author.toString(),
                currentWord: settings.currentWord as string,
                nextLetter: (settings.currentWord as string).slice(-1)
            }
        );
        this.client.sender.msgChannel(msg.channel, { embeds: [embed] });

        return { result: "SUCCESS" };
    }
}
