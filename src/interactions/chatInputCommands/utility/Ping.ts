import { HandlerResult } from "@/types";
import { ChatInputCommand } from "@/structures";
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export default class PingChatInputCommand extends ChatInputCommand {
    constructor() {
        super({
            builder: new SlashCommandBuilder()
                .setName("ping")
                .setNameLocalization("nl", "ping")
                .setDescription("Check the bots response time")
                .setDescriptionLocalization("nl", "Bekijk de bots reactie tijd")
                .setDMPermission(true)
                .addStringOption(option =>
                    option
                        .setName("action")
                        .setNameLocalization("nl", "actie")
                        .setDescription("Extra actions for the ping command")
                        .setDescriptionLocalization(
                            "nl",
                            "Extra acties voor het ping command"
                        )
                        .addChoices({
                            name: "Explain",
                            name_localizations: { nl: "Uitleg" },
                            value: "explain"
                        })
                ),
            enabled: true
        });
    }

    public async run(i: ChatInputCommandInteraction): Promise<HandlerResult> {
        // Ping action
        switch (i?.options?.getString("action", false)) {
            // Explain
            case "explain": {
                this.client.sender.reply(
                    i,
                    { ephemeral: true },
                    { langType: "EMBED", langLocation: "ping.explainEmbed" }
                );
                break;
            }

            // Ping (default)
            default: {
                // Send a pinging message
                const reply = await this.client.sender.reply(
                    i,
                    { ephemeral: true, fetchReply: true },
                    { langType: "EMBED", langLocation: "ping.pingingEmbed" }
                );
                if (!reply) {
                    return {
                        result: "ERRORED",
                        note: "Initial message unavailable to check ping",
                        error: new Error("Pinging message unavailable")
                    };
                }

                // Calculate the delay and edit the reply
                this.client.sender.reply(
                    i,
                    {},
                    {
                        method: "EDIT_REPLY",
                        langType: "EMBED",
                        langLocation: "ping.resultEmbed",
                        langVariables: {
                            timeDiff: (
                                reply.createdTimestamp - i.createdTimestamp
                            ).toString(),
                            wsPing: this.client.ws.ping.toString()
                        }
                    }
                );
            }
        }
        return { result: "SUCCESS" };
    }
}
