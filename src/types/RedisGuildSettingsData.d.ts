import { GuildCountingSettings } from "./GuildCountingSettings";
import { GuildCringeSettings } from "./GuildCringeSettings";
import { GuildCalendarSettings } from "./GuildCalendarSettings";
import { GuildWordSnakeSettings } from "./GuildWordSnakeSettings";
import { GuildWelcomeSettings } from "./GuildWelcomeSettings";

export interface RedisGuildSettingsData {
    counting: GuildCountingSettings;
    cringe: GuildCringeSettings;
    calendar: GuildCalendarSettings;
    wordSnake: GuildWordSnakeSettings;
    welcome: GuildWelcomeSettings;
}
