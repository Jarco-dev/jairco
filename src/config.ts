import { Config } from "@/types";
import { GatewayIntentBits } from "discord.js";

const config: Config = {
    // Discord client options
    CLIENT_OPTIONS: {
        intents: [GatewayIntentBits.Guilds]
    },

    // Bot version (acquired from package.json)
    VERSION: require("../package.json").version
};

export default config;
