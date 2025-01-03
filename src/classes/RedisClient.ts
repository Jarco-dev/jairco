import { Client } from "@/classes";
import Redis from "ioredis";
import { Snowflake } from "discord.js";
import {
    RedisMessageContextData,
    RedisGuildSettingsData,
    BlacklistData,
    Camelize,
    ChannelSettings
} from "@/types";
import Prisma from "@prisma/client";

export class RedisClient {
    private client: Client;
    private redis: Redis;
    private prefixes = {
        messageContext: "messageContext",
        guildSettings: "guildSettings",
        blacklist: "blacklist",
        cringeAddTipTimeout: "cringeAddTipTimeout",
        channelSettings: "guildChannelSettings"
    };

    private messageContextExpiry: {
        [K in keyof RedisMessageContextData]: number;
    } = {
        groupPermissions: 60 * 15,
        cringeDelete: 60 * 5,
        cringeReset: 60 * 5,
        cringeViewUser: 60 * 15,
        cringeLeaderboard: 60 * 15,
        countingChannelSet: 60 * 5,
        countingBlacklistList: 60 * 15,
        countingLeaderboard: 60 * 15,
        calendarEvents: 60 * 15,
        wordSnakeChannelSet: 60 * 5,
        wordSnakeBlacklistList: 60 * 15,
        wordSnakeLeaderboard: 16 * 15
    };

    constructor(client: Client) {
        this.client = client;
        this.redis = new Redis(
            this.client.sConfig.REDIS_PORT,
            this.client.sConfig.REDIS_HOST,
            {
                username: this.client.sConfig.REDIS_USER,
                password: this.client.sConfig.REDIS_PASSWORD,
                db: this.client.sConfig.REDIS_DATABASE
            }
        );
    }

    public async setMessageContext<T extends keyof RedisMessageContextData>(
        type: T,
        messageId: Snowflake,
        context: RedisMessageContextData[T]
    ): Promise<RedisMessageContextData[T] | undefined> {
        this.client.logger.verbose(
            `[RedisClient] Set: ${this.prefixes.messageContext}:${type}:${messageId}`
        );
        const res = await this.redis.setex(
            `${this.prefixes.messageContext}:${type}:${messageId}`,
            this.messageContextExpiry[type],
            JSON.stringify(context)
        );
        return res === "OK" ? context : undefined;
    }

    public async getMessageContext<T extends keyof RedisMessageContextData>(
        type: T,
        messageId: Snowflake
    ): Promise<RedisMessageContextData[T] | undefined> {
        this.client.logger.verbose(
            `[RedisClient] Get: ${this.prefixes.messageContext}:${type}:${messageId}`
        );
        const res = await this.redis.get(
            `${this.prefixes.messageContext}:${type}:${messageId}`
        );
        return res ? JSON.parse(res) : undefined;
    }

    public async delMessageContext<T extends keyof RedisMessageContextData>(
        type: T,
        messageId: Snowflake
    ): Promise<number> {
        this.client.logger.verbose(
            `[RedisClient] Del: ${this.prefixes.messageContext}:${type}:${messageId}`
        );
        return this.redis.del(
            `${this.prefixes.messageContext}:${type}:${messageId}`
        );
    }

    public async setGuildSettings<T extends keyof RedisGuildSettingsData>(
        type: T,
        guildId: Snowflake,
        settings: RedisGuildSettingsData[T]
    ): Promise<RedisGuildSettingsData[T] | undefined> {
        this.client.logger.verbose(
            `[RedisClient] Set: ${this.prefixes.guildSettings}:${type}:${guildId}`
        );
        const res = await this.redis.setex(
            `${this.prefixes.guildSettings}:${type}:${guildId}`,
            60 * 15,
            JSON.stringify(settings)
        );
        return res === "OK" ? settings : undefined;
    }

    public async getGuildSettings<T extends keyof RedisGuildSettingsData>(
        type: T,
        guildId: Snowflake
    ): Promise<RedisGuildSettingsData[T] | undefined> {
        this.client.logger.verbose(
            `[RedisClient] Get: ${this.prefixes.guildSettings}:${type}:${guildId}`
        );
        const res = await this.redis.get(
            `${this.prefixes.guildSettings}:${type}:${guildId}`
        );
        return res ? JSON.parse(res) : undefined;
    }

    public async delGuildSettings<T extends keyof RedisGuildSettingsData>(
        type: T,
        guildId: Snowflake
    ): Promise<number> {
        this.client.logger.verbose(
            `[RedisClient] Del: ${this.prefixes.guildSettings}:${type}:${guildId}`
        );
        return this.redis.del(
            `${this.prefixes.guildSettings}:${type}:${guildId}`
        );
    }

    public async setBlacklist(
        type: Camelize<Prisma.BlacklistTypes>,
        guildId: Snowflake,
        userId: Snowflake,
        data: BlacklistData
    ): Promise<BlacklistData | undefined> {
        this.client.logger.verbose(
            `[RedisClient] Set: ${this.prefixes.blacklist}:${type}:${guildId}:${userId}`
        );
        const res = await this.redis.setex(
            `${this.prefixes.blacklist}:${type}:${guildId}:${userId}`,
            60 * 15,
            JSON.stringify(data)
        );
        return res === "OK" ? data : undefined;
    }

    public async getBlacklist(
        type: Camelize<Prisma.BlacklistTypes>,
        guildId: Snowflake,
        userId: Snowflake
    ): Promise<BlacklistData | undefined> {
        this.client.logger.verbose(
            `[RedisClient] Get: ${this.prefixes.blacklist}:${type}:${guildId}:${userId}`
        );
        const res = await this.redis.get(
            `${this.prefixes.blacklist}:${type}:${guildId}:${userId}`
        );
        return res ? JSON.parse(res) : undefined;
    }

    public async delBlacklist(
        type: Camelize<Prisma.BlacklistTypes>,
        guildId: Snowflake,
        userId: Snowflake
    ): Promise<number> {
        this.client.logger.verbose(
            `[RedisClient] Del: ${this.prefixes.blacklist}:${type}:${guildId}:${userId}`
        );
        return this.redis.del(
            `${this.prefixes.blacklist}:${type}:${guildId}:${userId}`
        );
    }

    public async setCringeAddTipTimeout(
        userId: Snowflake,
        date: Date
    ): Promise<Date | undefined> {
        this.client.logger.verbose(
            `[RedisClient] Set: ${this.prefixes.cringeAddTipTimeout}:${userId}`
        );
        const res = await this.redis.setex(
            `${this.prefixes.cringeAddTipTimeout}:${userId}`,
            86400 * 7,
            date.toISOString()
        );
        return res ? date : undefined;
    }

    public async getCringeAddTipTimeout(
        userId: Snowflake
    ): Promise<Date | undefined> {
        this.client.logger.verbose(
            `[RedisClient] Get: ${this.prefixes.cringeAddTipTimeout}:${userId}`
        );
        const res = await this.redis.get(
            `${this.prefixes.cringeAddTipTimeout}:${userId}`
        );
        return res ? new Date(res) : undefined;
    }

    public async delCringeAddTipTimeout(userId: Snowflake): Promise<number> {
        this.client.logger.verbose(
            `[RedisClient] Del: ${this.prefixes.cringeAddTipTimeout}:${userId}`
        );
        return this.redis.del(`${this.prefixes.cringeAddTipTimeout}:${userId}`);
    }

    public async setChannelSettings(
        channelId: Snowflake,
        data: ChannelSettings
    ): Promise<ChannelSettings | undefined> {
        this.client.logger.verbose(
            `[RedisClient] Set: ${this.prefixes.channelSettings}:${channelId}`
        );
        const res = await this.redis.setex(
            `${this.prefixes.channelSettings}:${channelId}`,
            60 * 15,
            JSON.stringify(data)
        );
        return res === "OK" ? data : undefined;
    }

    public async getChannelSettings(
        channelId: Snowflake
    ): Promise<ChannelSettings | undefined> {
        this.client.logger.verbose(
            `[RedisClient] Get: ${this.prefixes.channelSettings}:${channelId}`
        );
        const res = await this.redis.get(
            `${this.prefixes.channelSettings}:${channelId}`
        );
        return res ? JSON.parse(res) : undefined;
    }

    public async delChannelSettings(channelId: Snowflake): Promise<number> {
        this.client.logger.verbose(
            `[RedisClient] Del: ${this.prefixes.channelSettings}:${channelId}`
        );
        return this.redis.del(`${this.prefixes.channelSettings}:${channelId}`);
    }
}
