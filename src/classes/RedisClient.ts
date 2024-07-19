import { Client } from "@/classes";
import Redis from "ioredis";
import { Snowflake } from "discord.js";
import { RedisMessageContext } from "@/types";

export class RedisClient {
    private client: Client;
    private redis: Redis;
    private prefixes = {
        messageContext: "messageContext"
    };

    private messageContextExpiry: { [K in keyof RedisMessageContext]: number } =
        {
            groupPermissions: 60 * 15
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

    public async setMessageContext<T extends keyof RedisMessageContext>(
        type: T,
        messageId: Snowflake,
        context: RedisMessageContext[T]
    ): Promise<RedisMessageContext[T] | undefined> {
        const res = await this.redis.setex(
            `${this.prefixes.messageContext}:${type}:${messageId}`,
            this.messageContextExpiry[type],
            JSON.stringify(context)
        );
        return res === "OK" ? context : undefined;
    }

    public async getMessageContext<T extends keyof RedisMessageContext>(
        type: T,
        messageId: Snowflake
    ): Promise<RedisMessageContext[T] | undefined> {
        const res = await this.redis.get(
            `${this.prefixes.messageContext}:${type}:${messageId}`
        );
        if (!res) return undefined;
        return res ? JSON.parse(res) : undefined;
    }

    public async delMessageContext<T extends keyof RedisMessageContext>(
        type: T,
        messageId: Snowflake
    ): Promise<number> {
        return this.redis.del(
            `${this.prefixes.messageContext}:${type}:${messageId}}`
        );
    }
}
