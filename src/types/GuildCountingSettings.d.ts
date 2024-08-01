import { Snowflake } from "discord.js";

interface Settings {
    countingEnabled: boolean;
    countingChannel: Snowflake;
    highestCount: number;
    currentCount: number;
    currentCountUser: Snowflake;
}

export type GuildCountingSettings = Partial<Settings>;
