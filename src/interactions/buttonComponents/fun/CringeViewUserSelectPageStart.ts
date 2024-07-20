import { HandlerResult } from "@/types";
import { ButtonComponent } from "@/structures";
import { ButtonInteraction, ButtonBuilder, ButtonStyle } from "discord.js";
import CringeViewUserSelectPageModal from "@/modal/fun/CringeViewUserSelectPage";

export default class CringeViewUserSelectPageStartButtonComponent extends ButtonComponent {
    public static readonly builder = new ButtonBuilder()
        .setCustomId("cringeViewUserSelectPageStart")
        .setStyle(ButtonStyle.Secondary)
        .setLabel("placeholder");

    constructor() {
        super({
            builder: CringeViewUserSelectPageStartButtonComponent.builder
        });
    }

    public async run(i: ButtonInteraction): Promise<HandlerResult> {
        const context = await this.client.redis.getMessageContext(
            "cringeViewUser",
            i.message.id
        );
        if (!context) {
            this.client.sender.reply(
                i,
                { ephemeral: true, components: [] },
                {
                    langLocation: "misc.actionExpired",
                    msgType: "INVALID",
                    method: "UPDATE"
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
            CringeViewUserSelectPageModal.getTranslatedBuilder(
                i.locale,
                this.client.lang
            )
        );

        return { result: "SUCCESS" };
    }
}
