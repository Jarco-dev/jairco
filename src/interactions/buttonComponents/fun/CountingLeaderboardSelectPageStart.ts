import { HandlerResult } from "@/types";
import { ButtonComponent } from "@/structures";
import {
    ButtonInteraction,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} from "discord.js";
import CountingLeaderboardSelectPageModal from "@/modal/fun/CountingLeaderboardSelectPage";

export default class CountingLeaderboardSelectPageStartButtonComponent extends ButtonComponent {
    public static readonly builder = new ButtonBuilder()
        .setCustomId("countingLeaderboardSelectPageStart")
        .setStyle(ButtonStyle.Secondary)
        .setLabel("placeholder");

    constructor() {
        super({
            builder: CountingLeaderboardSelectPageStartButtonComponent.builder
        });
    }

    public async run(i: ButtonInteraction): Promise<HandlerResult> {
        const context = await this.client.redis.getMessageContext(
            "countingLeaderboard",
            i.message.id
        );
        if (!context) {
            const buttons = new ActionRowBuilder<ButtonBuilder>(
                i.message.components[0].toJSON()
            );
            buttons.components.forEach(b => b.setDisabled(true));
            await this.client.sender.reply(
                i,
                { embeds: i.message.embeds, components: [buttons] },
                { method: "UPDATE" }
            );

            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "misc.pageMenuUnavailable",
                    msgType: "INVALID",
                    method: "FOLLOW_UP"
                }
            );
            return { result: "ACTION_EXPIRED" };
        }

        i.showModal(
            CountingLeaderboardSelectPageModal.getTranslatedBuilder(
                i.locale,
                this.client.lang
            )
        );

        return { result: "SUCCESS" };
    }
}
