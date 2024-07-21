import { ClientOptions, PermissionResolvable } from "discord.js";

export interface Config {
    CLIENT_OPTIONS: ClientOptions;
    NEEDED_BOT_PERMISSIONS: PermissionResolvable
    VERSION: string;
}
