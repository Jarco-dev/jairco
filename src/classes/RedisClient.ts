import { Client } from "@/classes";
import Redis from "ioredis";
import { Snowflake } from "discord.js";
import { RedisMessageContextData } from "@/types";

export class RedisClient {
    private client: Client;
    private redis: Redis;
    private prefixes = {
        messageContext: "messageContext"
    };

    private messageContextExpiry: {
        [K in keyof RedisMessageContextData]: number;
    } = {
        groupPermissions: 60 * 15,
        cringeDelete: 60 * 5,
        cringeReset: 60 * 5,
        cringeViewUser: 60 * 15,
        cringeLeaderboard: 60 * 15
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
        this.client.logger.verbose(`[RedisClient] Set: ${this.prefixes.messageContext}:${type}:${messageId}`);
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
        this.client.logger.verbose(`[RedisClient] Get: ${this.prefixes.messageContext}:${type}:${messageId}`);
        const res = await this.redis.get(
            `${this.prefixes.messageContext}:${type}:${messageId}`
        );
        return res ? JSON.parse(res) : undefined;
    }

    public async delMessageContext<T extends keyof RedisMessageContextData>(
        type: T,
        messageId: Snowflake
    ): Promise<number> {
        this.client.logger.verbose(`[RedisClient] Del: ${this.prefixes.messageContext}:${type}:${messageId}`);
        return this.redis.del(
            `${this.prefixes.messageContext}:${type}:${messageId}`
        );
    }
}
