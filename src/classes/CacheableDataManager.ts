import { Client } from "@/classes";
import { Snowflake } from "discord.js";
import {
    GuildCountingSettings,
    BlacklistData,
    Camelize,
    GuildCringeSettings,
    GuildCalendarSettings,
    GuildWordSnakeSettings,
    ChannelSettings
} from "@/types";
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
            await this.client.redis.getBlacklist(type, guildId, userId);
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

        this.client.redis.setBlacklist(type, guildId, userId, blacklist);

        return blacklist;
    }

    public async getCringeSettings(
        guildId: Snowflake
    ): Promise<GuildCringeSettings | undefined> {
        const cache: GuildCringeSettings | undefined =
            await this.client.redis.getGuildSettings("cringe", guildId);
        if (cache) return cache;

        const settingTypes: Prisma.GuildSetting[] = ["CRINGE_ENABLED"];
        const dbSettings = await this.client.prisma.guildSettings.findMany({
            where: {
                type: { in: settingTypes },
                Guild: { discordId: guildId }
            },
            select: { type: true, value: true }
        });
        if (dbSettings.length === 0) return undefined;

        const settings: GuildCringeSettings = {};
        for (const setting of dbSettings) {
            switch (setting.type) {
                case "CRINGE_ENABLED":
                    settings.cringeEnabled = !!parseInt(setting.value);
                    break;
            }
        }

        this.client.redis.setGuildSettings("cringe", guildId, settings);

        return settings;
    }

    public async getCalendarSettings(
        guildId: Snowflake
    ): Promise<GuildCalendarSettings | undefined> {
        const cache: GuildCalendarSettings | undefined =
            await this.client.redis.getGuildSettings("calendar", guildId);
        if (cache) return cache;

        const settingTypes: Prisma.GuildSetting[] = [
            "CALENDAR_ENABLED",
            "CALENDAR_AUTO_DELETE"
        ];
        const dbSettings = await this.client.prisma.guildSettings.findMany({
            where: {
                type: { in: settingTypes },
                Guild: { discordId: guildId }
            },
            select: { type: true, value: true }
        });
        if (dbSettings.length === 0) return undefined;

        const settings: GuildCalendarSettings = {};
        for (const setting of dbSettings) {
            switch (setting.type) {
                case "CALENDAR_ENABLED":
                    settings.calendarEnabled = !!parseInt(setting.value);
                    break;
                case "CALENDAR_AUTO_DELETE":
                    settings.calendarAutoDelete = !!parseInt(setting.value);
                    break;
            }
        }

        this.client.redis.setGuildSettings("calendar", guildId, settings);

        return settings;
    }

    public async getWordSnakeSettings(
        guildId: Snowflake
    ): Promise<GuildWordSnakeSettings | undefined> {
        const cache: GuildWordSnakeSettings | undefined =
            await this.client.redis.getGuildSettings("wordSnake", guildId);
        if (cache) return cache;

        const settingTypes: Prisma.GuildSetting[] = [
            "WORD_SNAKE_ENABLED",
            "WORD_SNAKE_CHANNEL",
            "HIGHEST_WORD_SNAKE",
            "CURRENT_WORD_SNAKE",
            "CURRENT_WORD",
            "CURRENT_WORD_USER"
        ];
        const dbSettings = await this.client.prisma.guildSettings.findMany({
            where: {
                type: { in: settingTypes },
                Guild: { discordId: guildId }
            },
            select: { type: true, value: true }
        });
        if (dbSettings.length === 0) return undefined;

        const settings: GuildWordSnakeSettings = {};
        for (const setting of dbSettings) {
            switch (setting.type) {
                case "WORD_SNAKE_ENABLED":
                    settings.wordSnakeEnabled = !!parseInt(setting.value);
                    break;
                case "WORD_SNAKE_CHANNEL":
                    settings.wordSnakeChannel = setting.value;
                    break;
                case "HIGHEST_WORD_SNAKE":
                    settings.highestWordSnake = parseInt(setting.value);
                    break;
                case "CURRENT_WORD_SNAKE":
                    settings.currentWordSnake = parseInt(setting.value);
                    break;
                case "CURRENT_WORD":
                    settings.currentWord = setting.value;
                    break;
                case "CURRENT_WORD_USER":
                    settings.currentWordUser = setting.value;
                    break;
            }
        }

        this.client.redis.setGuildSettings("wordSnake", guildId, settings);

        return settings;
    }

    public async getChannelSettings(
        channelId: Snowflake
    ): Promise<ChannelSettings | undefined> {
        const cache: ChannelSettings | undefined =
            await this.client.redis.getChannelSettings(channelId);
        if (cache) return cache;

        const dbSettings = await this.client.prisma.channels.findUnique({
            where: { discordId: channelId },
            select: {
                stickerFilter: true
            }
        });
        if (!dbSettings) return undefined;

        const settings: ChannelSettings = {
            stickerFilter: dbSettings.stickerFilter
        };

        this.client.redis.setChannelSettings(channelId, settings);

        return settings;
    }
}
