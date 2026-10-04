import { Snowflake } from "discord.js";

interface Settings {
    welcomeEnabled: boolean;
    welcomeMessage: string;
    welcomeChannel: Snowflake;
}

export type GuildWelcomeSettings = Partial<Settings>;
