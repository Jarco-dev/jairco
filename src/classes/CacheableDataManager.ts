import { Client } from "@/classes";
import { Snowflake } from "discord.js";
import { GuildCountingSettings, BlacklistData, Camelize } from "@/types";
import Prisma from "@prisma/client";

export class CacheableDataManager {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    public async getCountingSettings(
        guildId: Snowflake
    ): Promise<GuildCountingSettings | undefined> {
        const cache: GuildCountingSettings | undefined =
            await this.client.redis.getGuildSettings("counting", guildId);
        if (cache) return cache;

        const settingTypes: Prisma.GuildSetting[] = [
            "COUNTING_ENABLED",
            "COUNTING_CHANNEL",
            "HIGHEST_COUNT",
            "CURRENT_COUNT",
            "CURRENT_COUNT_USER"
        ];
        const dbSettings = await this.client.prisma.guildSettings.findMany({
            where: {
                type: { in: settingTypes },
                Guild: { discordId: guildId }
            },
            select: { type: true, value: true }
        });
        if (dbSettings.length === 0) return undefined;

        const settings: GuildCountingSettings = {};
        for (const setting of dbSettings) {
            switch (setting.type) {
                case "COUNTING_ENABLED":
                    settings.countingEnabled = !!parseInt(setting.value);
                    break;
                case "COUNTING_CHANNEL":
                    settings.countingChannel = setting.value;
                    break;
                case "HIGHEST_COUNT":
                    settings.highestCount = parseInt(setting.value);
                    break;
                case "CURRENT_COUNT":
                    settings.currentCount = parseInt(setting.value);
                    break;
                case "CURRENT_COUNT_USER":
                    this.client.logger.debug(setting);
                    settings.currentCountUser = setting.value;
                    break;
            }
        }

        this.client.redis.setGuildSettings("counting", guildId, settings);

        return settings;
    }

    public async getBlacklist(
        type: Camelize<Prisma.BlacklistTypes>,
        guildId: Snowflake,
        userId: Snowflake
    ): Promise<BlacklistData | undefined> {
        const cache: BlacklistData | undefined =
            await this.client.redis.getBlacklist("counting", guildId, userId);
        if (cache) return cache;

        let dbType: Prisma.BlacklistTypes;
        switch (type) {
            case "counting":
                dbType = "COUNTING";
                break;

            default:
                throw new Error(`the ${type} blacklist type is not supported`);
        }

        const dbBlacklist = await this.client.prisma.blacklists.findUnique({
            where: { guildIdUserIdType: guildId + userId + dbType },
            select: { reason: true }
        });
        if (!dbBlacklist) return undefined;

        const blacklist: BlacklistData = {
            reason: dbBlacklist.reason ?? undefined
        };

        this.client.redis.setBlacklist("counting", guildId, userId, blacklist);

        return blacklist;
    }
}
