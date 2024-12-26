import { GuildCountingSettings } from "./GuildCountingSettings";
import { GuildCringeSettings } from "./GuildCringeSettings";
import { GuildCalendarSettings } from "./GuildCalendarSettings";
import { GuildWordSnakeSettings } from "./GuildWordSnakeSettings";

export interface RedisGuildSettingsData {
    counting: GuildCountingSettings;
    cringe: GuildCringeSettings;
    calendar: GuildCalendarSettings;
    wordSnake: GuildWordSnakeSettings;
}
