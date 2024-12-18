import { HandlerResult } from "@/types";
import { EventHandler } from "@/structures";
import { Message } from "discord.js";

export default class MessageCreateEventHandler extends EventHandler<"messageCreate"> {
    constructor() {
        super({
            name: "messageCreate"
        });
    }

    public run(msg: Message): HandlerResult | Promise<HandlerResult> {
        try {
            return this.runCounting(msg);
        } catch (err: any) {
            this.client.logger.error(
                "Error while handling message for counting",
                err
            );
            return {
                result: "ERRORED",
                note: "Error while running counting",
                error: err
            };
        }
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
                        User: { connect: { discordId: msg.author.id } }
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
}
