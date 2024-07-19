import { Snowflake } from "discord.js";
import { Groups } from "@prisma/client";

export interface RedisMessageContext {
    groupPermissions: {
        groupId: Groups["id"];
        menuOwnerId: Snowflake;
    };
}
