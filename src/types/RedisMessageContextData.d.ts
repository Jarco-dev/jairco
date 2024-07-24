import { Snowflake } from "discord.js";
import { Cringes, Groups } from "@prisma/client";

export interface RedisMessageContextData {
    groupPermissions: {
        groupId: Groups["id"];
        menuOwnerId: Snowflake;
    };
    cringeDelete: {
        cringeId: Cringes["id"];
        buttonOwnerId: Snowflake;
    };
    cringeReset: {
        userId: Snowflake;
        type: "given" | "received";
        buttonOwnerId: Snowflake;
    };
    cringeViewUser: {
        page: number;
        userId: Snowflake;
        type: "given" | "received";
        pageMenuOwnerId: Snowflake;
    };
    cringeLeaderboard: {
        page: number;
        type: "given" | "received";
        pageMenuOwnerId: Snowflake;
    };
}
