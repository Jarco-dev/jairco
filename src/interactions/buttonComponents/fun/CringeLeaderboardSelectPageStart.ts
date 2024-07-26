import { HandlerResult } from "@/types";
import { ButtonComponent } from "@/structures";
import {ButtonInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder} from "discord.js";
import CringeLeaderboardSelectPageModal from "@/modal/fun/CringeLeaderboardSelectPage";

export default class CringeLeaderboardSelectPageStartButtonComponent extends ButtonComponent {
    public static readonly builder = new ButtonBuilder()
        .setCustomId("cringeLeaderboardSelectPageStart")
        .setStyle(ButtonStyle.Secondary)
        .setLabel("placeholder");

    constructor() {
        super({
            builder: CringeLeaderboardSelectPageStartButtonComponent.builder
        });
    }

    public async run(i: ButtonInteraction): Promise<HandlerResult> {
        const context = await this.client.redis.getMessageContext(
            "cringeLeaderboard",
            i.message.id
        );
        if (!context) {
            const buttons = new ActionRowBuilder<ButtonBuilder>(i.message.components[0].toJSON())
            buttons.components.forEach(b => b.setDisabled(true));
            await this.client.sender.reply(i, { embeds: i.message.embeds, components: [buttons] }, { method: "UPDATE"});

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
        if (i.user.id !== context.pageMenuOwnerId) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        i.showModal(
            CringeLeaderboardSelectPageModal.getTranslatedBuilder(
                i.locale,
                this.client.lang
            )
        );

        return { result: "SUCCESS" };
    }
}
