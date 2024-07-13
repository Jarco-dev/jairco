import { Config } from "@/types";
import { IntentsBitField } from "discord.js";

const config: Config = {
    // Discord client options
    CLIENT_OPTIONS: {
        intents: []
    },

    // Bot version (acquired from package.json)
    VERSION: require("../package.json").version
};

export default config;
