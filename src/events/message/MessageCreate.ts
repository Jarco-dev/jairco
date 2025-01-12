import { HandlerResult } from "@/types";
import { EventHandler } from "@/structures";
import { Message } from "discord.js";
import { BotPermissionsBitField } from "@/classes";

export default class MessageCreateEventHandler extends EventHandler<"messageCreate"> {
    constructor() {
        super({
            name: "messageCreate"
        });
    }

    public run(msg: Message): HandlerResult | Promise<HandlerResult> {
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

        try {
            this.runChannelFilters(msg);
        } catch (err: any) {
            this.client.logger.error(
                "Error while handling message for sticker filter",
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

        const count = parseInt(msg.content);
        const blacklist = await this.client.cacheableData.getBlacklist(
            "counting",
            msg.guild.id,
            msg.author.id
        );
        if (
            settings.currentCountUser === msg.author.id ||
            blacklist ||
            isNaN(count)
        ) {
            msg.delete().catch(() => {});
            return {
                result: "OTHER",
                note: "User already counted last, is blacklisted or gave a invalid number"
            };
        }

        if (count !== (settings?.currentCount ?? 0) + 1) {
            const highestCountBeaten =
                (settings?.currentCount ?? 0) > (settings.highestCount ?? 0);
            await this.client.prisma.$transaction([
                this.client.prisma.blacklists.create({
                    data: {
                        type: "COUNTING",
                        reason: "Incorrect count",
                        guildIdUserIdType:
                            msg.guild.id + msg.author.id + "COUNTING",
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
                }),
                this.client.prisma.countingStats.upsert({
                    where: { guildIdAndUserId: msg.guild.id + msg.author.id },
                    update: { incorrect: { increment: 1 } },
                    create: {
                        incorrect: 1,
                        guildIdAndUserId: msg.guild.id + msg.author.id,
                        Guild: { connect: { discordId: msg.guild.id } },
                        User: {
                            connectOrCreate: {
                                where: { discordId: msg.author.id },
                                create: { discordId: msg.author.id }
                            }
                        }
                    }
                }),
                this.client.prisma.guildSettings.deleteMany({
                    where: {
                        Guild: { discordId: msg.guild.id },
                        type: { in: ["CURRENT_COUNT", "CURRENT_COUNT_USER"] }
                    }
                }),
                ...(highestCountBeaten
                    ? [
                          this.client.prisma.guildSettings.upsert({
                              where: {
                                  guildIdAndType: msg.guild.id + "HIGHEST_COUNT"
                              },
                              update: {
                                  value: (settings.currentCount ?? 0).toString()
                              },
                              create: {
                                  type: "HIGHEST_COUNT",
                                  guildIdAndType:
                                      msg.guild.id + "HIGHEST_COUNT",
                                  value: (
                                      settings.currentCount ?? 0
                                  ).toString(),
                                  Guild: {
                                      connectOrCreate: {
                                          where: { discordId: msg.guild.id },
                                          create: { discordId: msg.guild.id }
                                      }
                                  }
                              }
                          })
                      ]
                    : [])
            ]);
            await this.client.redis.setGuildSettings("counting", msg.guild.id, {
                ...settings,
                currentCount: undefined,
                currentCountUser: undefined,
                ...(highestCountBeaten
                    ? { highestCount: settings.currentCount }
                    : {})
            });

            const embed = this.client.lang.getEmbed(
                this.client.lang.default,
                "counting.incorrectCountEmbed"
            );
            if (highestCountBeaten) {
                embed.setDescription(
                    this.client.lang.getString(
                        this.client.lang.default,
                        "counting.newHighestCount",
                        {
                            newCount: (settings.currentCount ?? 0).toString(),
                            oldCount: (settings.highestCount ?? 0).toString(),
                            delta: (
                                (settings.currentCount ?? 0) -
                                (settings.highestCount ?? 0)
                            ).toString()
                        }
                    )
                );
            }

            this.client.sender.msgChannel(msg.channel, {
                reply: { messageReference: msg, failIfNotExists: false },
                embeds: [embed]
            });
            msg.react("❌").catch(() => {});

            return { result: "OTHER", note: "Invalid number in message" };
        }

        const stats = await this.client.prisma.countingStats.findUnique({
            where: { guildIdAndUserId: msg.guild.id + msg.author.id },
            select: { highest: true }
        });
        await this.client.prisma.$transaction([
            this.client.prisma.guildSettings.upsert({
                where: { guildIdAndType: msg.guild.id + "CURRENT_COUNT" },
                update: { value: count.toString() },
                create: {
                    type: "CURRENT_COUNT",
                    guildIdAndType: msg.guild.id + "CURRENT_COUNT",
                    value: count.toString(),
                    Guild: {
                        connectOrCreate: {
                            where: { discordId: msg.guild.id },
                            create: { discordId: msg.guild.id }
                        }
                    }
                }
            }),
            this.client.prisma.guildSettings.upsert({
                where: { guildIdAndType: msg.guild.id + "CURRENT_COUNT_USER" },
                update: { value: msg.author.id },
                create: {
                    type: "CURRENT_COUNT_USER",
                    guildIdAndType: msg.guild.id + "CURRENT_COUNT_USER",
                    value: msg.author.id,
                    Guild: {
                        connectOrCreate: {
                            where: { discordId: msg.guild.id },
                            create: { discordId: msg.guild.id }
                        }
                    }
                }
            }),
            this.client.prisma.countingStats.upsert({
                where: { guildIdAndUserId: msg.guild.id + msg.author.id },
                update: {
                    ...(stats && count > stats.highest
                        ? { highest: count }
                        : {}),
                    correct: { increment: 1 }
                },
                create: {
                    ...(stats && count > stats.highest
                        ? { highest: count }
                        : {}),
                    correct: 1,
                    guildIdAndUserId: msg.guild.id + msg.author.id,
                    Guild: { connect: { discordId: msg.guild.id } },
                    User: {
                        connectOrCreate: {
                            where: { discordId: msg.author.id },
                            create: { discordId: msg.author.id }
                        }
                    }
                }
            })
        ]);
        await this.client.redis.setGuildSettings("counting", msg.guild.id, {
            ...settings,
            currentCount: count,
            currentCountUser: msg.author.id
        });

        msg.react("✅").catch(() => {});

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

        const words = msg.content.split(" ");
        const word = words.length >= 1 ? words[0].toLowerCase() : undefined;
        const accentFreeWord = word
            ?.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        if (
            settings.currentWordUser === msg.author.id ||
            !word ||
            !accentFreeWord
        ) {
            msg.delete().catch(() => {});
            return {
                result: "OTHER",
                note: "User already snaked last or gave a invalid word"
            };
        }

        const wordIsValid = await this.client.utils.isValidWordSnakeWord(word);
        if (settings.currentWord === undefined && !wordIsValid) {
            const embed = this.client.lang.getEmbed(
                "en-US",
                "wordSnake.firstWordInvalidEmbed"
            );
            this.client.sender.msgChannel(settings.wordSnakeChannel, {
                embeds: [embed]
            });
            msg.react("❌").catch(() => {});
            return {
                result: "OTHER",
                note: "First word is a invalid word"
            };
        }

        const wordCount = await this.client.prisma.usedWordSnakeWords.count({
            where: {
                Guild: { discordId: msg.guild.id },
                content: accentFreeWord
            }
        });
        if (wordCount > 0) {
            const embed = this.client.lang.getEmbed(
                "en-US",
                "wordSnake.duplicateWordEmbed"
            );
            msg.delete().catch(() => {});
            this.client.sender.msgChannel(
                settings.wordSnakeChannel,
                {
                    embeds: [embed]
                },
                { delTime: 5000 }
            );
            return { result: "OTHER", note: "Duplicate word" };
        }

        if (
            settings.currentWord !== undefined &&
            (!wordIsValid ||
                (settings.currentWord ?? accentFreeWord).slice(-1) !==
                    word.slice(0, 1))
        ) {
            const highestStreakBeaten =
                (settings?.currentWordSnake ?? 0) >
                (settings.highestWordSnake ?? 0);
            await this.client.prisma.$transaction([
                this.client.prisma.wordSnakeStats.upsert({
                    where: { guildIdAndUserId: msg.guild.id + msg.author.id },
                    update: { incorrect: { increment: 1 } },
                    create: {
                        incorrect: 1,
                        guildIdAndUserId: msg.guild.id + msg.author.id,
                        Guild: { connect: { discordId: msg.guild.id } },
                        User: {
                            connectOrCreate: {
                                where: { discordId: msg.author.id },
                                create: { discordId: msg.author.id }
                            }
                        }
                    }
                }),
                this.client.prisma.guildSettings.deleteMany({
                    where: {
                        Guild: { discordId: msg.guild.id },
                        type: {
                            in: [
                                "CURRENT_WORD_SNAKE",
                                "CURRENT_WORD",
                                "CURRENT_WORD_USER"
                            ]
                        }
                    }
                }),
                this.client.prisma.usedWordSnakeWords.deleteMany({
                    where: {
                        Guild: { discordId: msg.guild.id }
                    }
                }),
                ...(highestStreakBeaten
                    ? [
                          this.client.prisma.guildSettings.upsert({
                              where: {
                                  guildIdAndType:
                                      msg.guild.id + "HIGHEST_WORD_SNAKE"
                              },
                              update: {
                                  value: (
                                      settings.currentWordSnake ?? 0
                                  ).toString()
                              },
                              create: {
                                  type: "HIGHEST_WORD_SNAKE",
                                  guildIdAndType:
                                      msg.guild.id + "HIGHEST_WORD_SNAKE",
                                  value: (
                                      settings.currentWordSnake ?? 0
                                  ).toString(),
                                  Guild: {
                                      connectOrCreate: {
                                          where: { discordId: msg.guild.id },
                                          create: { discordId: msg.guild.id }
                                      }
                                  }
                              }
                          })
                      ]
                    : [])
            ]);
            await this.client.redis.setGuildSettings(
                "wordSnake",
                msg.guild.id,
                {
                    ...settings,
                    currentWordSnake: undefined,
                    currentWord: undefined,
                    currentWordUser: undefined,
                    ...(highestStreakBeaten
                        ? { highestWordSnake: settings.currentWordSnake }
                        : {})
                }
            );

            const embed = this.client.lang.getEmbed(
                this.client.lang.default,
                "wordSnake.incorrectWordEmbed",
                { words: (settings?.currentWordSnake ?? 0).toString() }
            );
            if (highestStreakBeaten) {
                embed.setDescription(
                    this.client.lang.getString(
                        this.client.lang.default,
                        "wordSnake.newHighestWordSnake",
                        {
                            newStreak: (
                                settings.currentWordSnake ?? 0
                            ).toString(),
                            oldStreak: (
                                settings.highestWordSnake ?? 0
                            ).toString(),
                            delta: (
                                (settings.currentWordSnake ?? 0) -
                                (settings.highestWordSnake ?? 0)
                            ).toString()
                        }
                    )
                );
            }

            this.client.sender.msgChannel(msg.channel, {
                reply: { messageReference: msg, failIfNotExists: false },
                embeds: [embed]
            });
            msg.react("❌").catch(() => {});

            return { result: "OTHER", note: "Invalid word in message" };
        }

        await this.client.prisma.$transaction([
            this.client.prisma.guildSettings.upsert({
                where: { guildIdAndType: msg.guild.id + "CURRENT_WORD" },
                update: { value: accentFreeWord },
                create: {
                    type: "CURRENT_WORD",
                    guildIdAndType: msg.guild.id + "CURRENT_WORD",
                    value: accentFreeWord,
                    Guild: {
                        connectOrCreate: {
                            where: { discordId: msg.guild.id },
                            create: { discordId: msg.guild.id }
                        }
                    }
                }
            }),
            this.client.prisma.guildSettings.upsert({
                where: { guildIdAndType: msg.guild.id + "CURRENT_WORD_USER" },
                update: { value: msg.author.id },
                create: {
                    type: "CURRENT_WORD_USER",
                    guildIdAndType: msg.guild.id + "CURRENT_WORD_USER",
                    value: msg.author.id,
                    Guild: {
                        connectOrCreate: {
                            where: { discordId: msg.guild.id },
                            create: { discordId: msg.guild.id }
                        }
                    }
                }
            }),
            this.client.prisma.wordSnakeStats.upsert({
                where: { guildIdAndUserId: msg.guild.id + msg.author.id },
                update: {
                    correct: { increment: 1 }
                },
                create: {
                    correct: 1,
                    guildIdAndUserId: msg.guild.id + msg.author.id,
                    Guild: { connect: { discordId: msg.guild.id } },
                    User: {
                        connectOrCreate: {
                            where: { discordId: msg.author.id },
                            create: { discordId: msg.author.id }
                        }
                    }
                }
            }),
            this.client.prisma.usedWordSnakeWords.create({
                data: {
                    Guild: { connect: { discordId: msg.guild.id } },
                    content: accentFreeWord
                }
            })
        ]);
        await this.client.redis.setGuildSettings("wordSnake", msg.guild.id, {
            ...settings,
            currentWordSnake: (settings.currentWordSnake ?? 0) + 1,
            currentWord: accentFreeWord,
            currentWordUser: msg.author.id
        });

        msg.react("✅").catch(() => {});

        return { result: "SUCCESS" };
    }

    private async runChannelFilters(msg: Message): Promise<HandlerResult> {
        if (msg.author.bot || !msg.inGuild()) {
            return {
                result: "OTHER",
                note: "Message is from bot or not in guild"
            };
        }

        const settings = await this.client.cacheableData.getChannelSettings(
            msg.channel.id
        );
        if (!settings) return { result: "SUCCESS" };

        const permissions = await this.client.utils.getMemberBotPermissions(
            msg.member!
        );
        if (
            settings.stickerFilter &&
            msg.stickers.size > 0 &&
            !permissions.has(BotPermissionsBitField.Flags.BypassStickerFilter)
        ) {
            msg.delete().catch(() => {});
        }

        return { result: "SUCCESS" };
    }
}
