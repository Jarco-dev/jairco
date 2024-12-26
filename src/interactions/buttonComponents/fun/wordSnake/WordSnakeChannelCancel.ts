import { HandlerResult } from "@/types";
import { ButtonComponent } from "@/structures";
import {
    ButtonInteraction,
    ButtonBuilder,
    ButtonStyle,
    LocaleString
} from "discord.js";
import { BotPermissionsBitField, LanguageManager } from "@/classes";

export default class WordSnakeChannelCancelButtonComponent extends ButtonComponent {
    public static readonly builder = new ButtonBuilder()
        .setCustomId("wordSnakeChannelCancel")
        .setLabel("placeholder")
        .setStyle(ButtonStyle.Danger);

    constructor() {
        super({
            builder: WordSnakeChannelCancelButtonComponent.builder
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
            "wordSnakeChannelSet",
            i.message.id
        );
        if (!context) {
            this.client.sender.reply(
                i,
                { components: [] },
                {
                    langLocation: "misc.actionExpired",
                    msgType: "INVALID",
                    method: "UPDATE"
                }
            );
            return { result: "ACTION_EXPIRED" };
        }

        const settings = await this.client.cacheableData.getWordSnakeSettings(
            i.guild!.id
        );
        if (!settings?.wordSnakeEnabled) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.featureDisabled", msgType: "INVALID" }
            );
            return { result: "FEATURE_DISABLED" };
        }

        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (
            !permissions.has(BotPermissionsBitField.Flags.ManageWordSnake) ||
            i.user.id !== context.buttonOwnerId
        ) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        this.client.redis.delMessageContext(
            "wordSnakeChannelSet",
            i.message.id
        );
        this.client.sender.reply(
            i,
            { components: [] },
            {
                langLocation: "wordSnake.channelSetCanceled",
                msgType: "SUCCESS",
                method: "UPDATE"
            }
        );

        return { result: "SUCCESS" };
    }
}
