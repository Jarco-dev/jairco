import { HandlerResult } from "@/types";
import { ChatInputCommand } from "@/structures";
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export default class AboutChatInputCommand extends ChatInputCommand {
    constructor() {
        super({
            builder: new SlashCommandBuilder()
                .setName("about")
                .setNameLocalization("nl", "over")
                .setDescription(
                    "View this bots policies and support server link"
                )
                .setDescriptionLocalization(
                    "nl",
                    "Bekijk de bot's TOS en privacy beleid, en help server link"
                )
                .setDMPermission(true),
            enabled: true
        });
    }

    public async run(i: ChatInputCommandInteraction): Promise<HandlerResult> {
        this.client.sender.reply(
            i,
            {},
            {
                langLocation: "about.embed",
                langType: "EMBED",
                langVariables: {
                    uptime: this.client.utils.parseTime(this.client.uptime ?? 0)
                }
            }
        );
        return { result: "SUCCESS" };
    }
}
