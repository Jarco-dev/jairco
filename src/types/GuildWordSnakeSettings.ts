import { Snowflake } from "discord.js";

interface Settings {
    wordSnakeEnabled: boolean;
    wordSnakeChannel: Snowflake;
    highestWordSnake: number;
    currentWordSnake: number;
    currentWord: string;
    currentWordUser: Snowflake;
}

export type GuildWordSnakeSettings = Partial<Settings>;
