import { Config } from "@/types";
import { GatewayIntentBits, PermissionsBitField } from "discord.js";

const config: Config = {
    // Discord client options
    CLIENT_OPTIONS: {
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.MessageContent
        ]
    },

    NEEDED_BOT_PERMISSIONS: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.AddReactions,
        PermissionsBitField.Flags.ManageMessages
    ],

    // Bot version (acquired from package.json)
    VERSION: require("../package.json").version,

    // Word list file location (required for word snake)
    WORD_LIST_PATH: "/basiswoorden-gekeurd.txt"
};

export default config;
