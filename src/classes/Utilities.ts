import { BotPermissionsBitField, Client } from "@/classes";
import {
    BaseInteraction,
    GuildChannelResolvable,
    GuildMember,
    PermissionResolvable
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
}
