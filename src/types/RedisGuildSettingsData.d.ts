import { GuildCountingSettings } from "./GuildCountingSettings";
import { GuildCringeSettings } from "./GuildCringeSettings";

export interface RedisGuildSettingsData {
    counting: GuildCountingSettings;
    cringe: GuildCringeSettings;
}
