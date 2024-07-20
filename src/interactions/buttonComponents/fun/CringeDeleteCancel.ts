import { HandlerResult } from "@/types";
import { ButtonComponent } from "@/structures";
import {
    ButtonInteraction,
    ButtonBuilder,
    LocaleString,
    ButtonStyle
} from "discord.js";
import { BotPermissionsBitField, LanguageManager } from "@/classes";

export default class CringeDeleteCancelButtonComponent extends ButtonComponent {
    public static readonly builder = new ButtonBuilder()
        .setCustomId("cringeDeleteCancel")
        .setLabel("placeholder")
        .setStyle(ButtonStyle.Danger);

    constructor() {
        super({
            builder: CringeDeleteCancelButtonComponent.builder
        });
    }

    public static getTranslatedBuilder(
        locale: LocaleString,
        langManager: LanguageManager
    ): ButtonBuilder {
        return new ButtonBuilder(this.builder.toJSON()).setLabel(
            langManager.getString(locale, "misc.cancel")
        );
    }

    public async run(i: ButtonInteraction): Promise<HandlerResult> {
        const context = await this.client.redis.getMessageContext(
            "cringeDelete",
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

        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (
            !permissions.has(BotPermissionsBitField.Flags.ManageCringe) ||
            i.user.id !== context.buttonOwnerId
        ) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        this.client.redis.delMessageContext("cringeDelete", i.message.id);

        this.client.sender.reply(
            i,
            { components: [] },
            {
                langLocation: "cringe.cringeDeleteCanceled",
                msgType: "SUCCESS",
                method: "UPDATE"
            }
        );

        return { result: "SUCCESS" };
    }
}
