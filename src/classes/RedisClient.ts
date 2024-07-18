import { Client } from "@/classes";
import Redis from "ioredis";
import { Snowflake } from "discord.js";
import { Groups } from "@prisma/client";

export class RedisClient {
    private client: Client;
    private redis: Redis;
    private prefixes = {
        groupModifyMessage: "groupModifyMessage"
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

    public async getGroupModifyMessage(
        messageId: Snowflake
    ): Promise<Groups["id"] | undefined> {
        const res = await this.redis.get(
            `${this.prefixes.groupModifyMessage}:${messageId}`
        );
        if (!res) return undefined;

        const permRoleId = parseInt(res);
        if (isNaN(permRoleId)) {
            this.client.logger.warn(
                `User id (${res}) from groupSettingsMessage could not be parsed to number`
            );
            return undefined;
        }

        return permRoleId;
    }

    public async setGroupModifyMessage(
        messageId: Snowflake,
        permRoleId: Groups["id"]
    ): Promise<Groups["id"] | undefined> {
        const res = await this.redis.setex(
            `${this.prefixes.groupModifyMessage}:${messageId}`,
            60 * 30, // 30 minutes
            permRoleId.toString()
        );
        return res === "OK" ? permRoleId : undefined;
    }

    public async delGroupModifyMessage(messageId: Snowflake): Promise<number> {
        return this.redis.del(
            `${this.prefixes.groupModifyMessage}:${messageId}`
        );
    }
}
