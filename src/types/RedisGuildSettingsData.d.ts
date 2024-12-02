import { GuildCountingSettings } from "./GuildCountingSettings";
import { GuildCringeSettings } from "./GuildCringeSettings";
import { GuildCalendarSettings } from "./GuildCalendarSettings";

export interface RedisGuildSettingsData {
    counting: GuildCountingSettings;
    cringe: GuildCringeSettings;
    calendar: GuildCalendarSettings;
}
