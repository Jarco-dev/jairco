import { BotPermissionsBitField, Client } from "@/classes";
import {
    BaseInteraction,
    EmbedBuilder,
    GuildChannelResolvable,
    GuildMember,
    PermissionResolvable,
    User
} from "discord.js";

export class Utilities {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    public parseTime(duration: number | bigint): string {
        if (typeof duration === "bigint") duration = Number(duration);
        let result = "";

        duration = Math.floor(duration / 1000);
        const sec = duration % 60;
        if (duration > 0 && sec > 0) result = sec + "s";

        duration = Math.floor(duration / 60);
        const min = duration % 60;
        if (duration > 0 && min > 0) result = min + "m " + result;

        duration = Math.floor(duration / 60);
        const hour = duration % 24;
        if (duration > 0 && hour > 0) result = hour + "h " + result;

        duration = Math.floor(duration / 24);
        const day = duration % 365;
        if (duration > 0 && day > 0) result = day + "d " + result;

        duration = Math.floor(duration / 365);
        const year = duration;
        if (duration > 0 && year > 0) result = year + "y " + result;

        return result;
    }

    public limitString(string: string, limit: number): string {
        if (string.length > limit) {
            return string.substring(0, limit + 3) + "...";
        } else {
            return string;
        }
    }

    public addNewLines(lines: string[]): string {
        return lines.join("\n");
    }

    public checkPermissions(
        member: GuildMember,
        permissions: PermissionResolvable[],
        channel?: GuildChannelResolvable
    ): { hasAll: true } | { hasAll: false; missing: PermissionResolvable[] } {
        let missing: PermissionResolvable[];

        if (channel) {
            missing = permissions.filter(
                perm => !member.permissionsIn(channel).has(perm)
            );
        } else {
            missing = permissions.filter(perm => !member.permissions.has(perm));
        }

        return missing.length === 0
            ? { hasAll: true }
            : {
                  hasAll: missing.length === 0,
                  missing: missing
              };
    }

    public async getMemberBotPermissions(
        source: BaseInteraction | GuildMember,
        addAdminToGuildAdmin = true
    ): Promise<BotPermissionsBitField> {
        const member =
            source instanceof GuildMember
                ? source
                : await source.guild!.members.fetch(source.user.id);
        const groups = await this.client.prisma.groups.findMany({
            where: {
                Guild: { discordId: source.guild!.id },
                OR: [
                    { Users: { some: { discordId: member.id } } },
                    {
                        Roles: {
                            some: {
                                discordId: {
                                    in: member.roles.cache.map(r => r.id)
                                }
                            }
                        }
                    }
                ]
            },
            select: {
                permissions: true
            }
        });

        const permissions = new BotPermissionsBitField();

        if (addAdminToGuildAdmin && member.permissions.has("Administrator")) {
            permissions.add(BotPermissionsBitField.Flags.Administrator);
        }
        if (groups.length > 0) {
            permissions.add(groups.reduce((m, g) => m | g.permissions, 0n));
        }

        return permissions;
    }

    public async getViewUserCringesPage(
        i: BaseInteraction,
        user: User,
        type: "given" | "received",
        cringeCount: number,
        page = 1
    ): Promise<EmbedBuilder> {
        const cringes = await this.client.prisma.cringes.findMany({
            skip: (page - 1) * 10,
            take: 10,
            orderBy: {
                createdAt: "desc"
            },
            where: {
                ...(type === "received"
                    ? {
                          ReceivedByUser: {
                              discordId: user.id
                          }
                      }
                    : { GivenByUser: { discordId: user.id } }),
                Guild: { discordId: i.guild!.id }
            },
            select: {
                id: true,
                createdAt: true,
                channelId: true,
                messageId: true,
                messageContent: true,
                ReceivedByUser: {
                    select: {
                        discordId: true
                    }
                },
                GivenByUser: {
                    select: {
                        discordId: true
                    }
                }
            }
        });

        if (type === "received") {
            return this.client.lang.getEmbed(
                i.locale,
                "cringe.userCringeReceivedEmbed",
                {
                    user: user.username,
                    cringeCount: cringeCount.toString(),
                    cringes: cringes
                        .map(c => {
                            let string = `(${c.id}) <t:${Math.round(
                                c.createdAt.getTime() / 1000
                            )}:R> - ${this.client.lang.getString(
                                i.locale,
                                "cringe.addedBy",
                                {
                                    user: `<@${c.GivenByUser.discordId}>`
                                }
                            )} `;
                            if (c.messageContent) {
                                string += ` [message](https://discord.com/channels/${
                                    i.guildId
                                }/${c.channelId}/${
                                    c.messageId
                                })\n*${c.messageContent.substring(0, 50)}${
                                    c.messageContent.length > 50 ? "..." : ""
                                }*`;
                            }

                            return string;
                        })
                        .join("\n\n")
                }
            );
        } else {
            return this.client.lang.getEmbed(
                i.locale,
                "cringe.userCringeGivenEmbed",
                {
                    user: user.username,
                    cringeCount: cringeCount.toString(),
                    cringes: cringes
                        .map(c => {
                            let string = `(${c.id}) <t:${Math.round(
                                c.createdAt.getTime() / 1000
                            )}:R> - ${this.client.lang.getString(
                                i.locale,
                                "cringe.givenTo",
                                {
                                    user: `<@${c.ReceivedByUser.discordId}>`
                                }
                            )} `;
                            if (c.messageContent) {
                                string += ` [message](https://discord.com/channels/${
                                    i.guildId
                                }/${c.channelId}/${
                                    c.messageId
                                })\n*${c.messageContent.substring(0, 50)}${
                                    c.messageContent.length > 50 ? "..." : ""
                                }*`;
                            }

                            return string;
                        })
                        .join("\n\n")
                }
            );
        }
    }

    public async getCringeLeaderboardPage(
        i: BaseInteraction,
        type: "given" | "received",
        page = 1
    ): Promise<EmbedBuilder> {
        const cringes = await this.client.prisma.users.findMany({
            skip: (page - 1) * 10,
            take: 10,
            where: {
                Guild: { every: { discordId: i.guild!.id } }
            },
            orderBy: {
                ...(type === "received"
                    ? { CringesReceived: { _count: "desc" } }
                    : { CringesGiven: { _count: "desc" } })
            },
            select: {
                discordId: true,
                _count: {
                    select: {
                        CringesReceived: true,
                        CringesGiven: true
                    }
                }
            }
        });

        if (type === "received") {
            return this.client.lang.getEmbed(
                i.locale,
                "cringe.receivedLeaderboard",
                {
                    topUsers: cringes
                        .filter(c => c._count.CringesReceived > 0)
                        .reduce(
                            (a, c, index) =>
                                (a += `**#${(page - 1) * 10 + index + 1}** <@${
                                    c.discordId
                                }> ${this.client.lang.getString(
                                    i.locale,
                                    "cringe.wasCringeTimes",
                                    {
                                        count: c._count.CringesReceived.toString()
                                    }
                                )}\n`),
                            ""
                        )
                }
            );
        } else {
            return this.client.lang.getEmbed(
                i.locale,
                "cringe.givenLeaderboard",
                {
                    topUsers: cringes
                        .filter(c => c._count.CringesGiven > 0)
                        .reduce(
                            (a, c, index) =>
                                (a += `**#${(page - 1) * 10 + index + 1}** <@${
                                    c.discordId
                                }> ${this.client.lang.getString(
                                    i.locale,
                                    "cringe.givenCringeTimes",
                                    { count: c._count.CringesGiven.toString() }
                                )}\n`),
                            ""
                        )
                }
            );
        }
    }
}
