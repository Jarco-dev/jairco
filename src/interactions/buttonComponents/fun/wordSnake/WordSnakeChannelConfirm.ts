import { HandlerResult } from "@/types";
import { ButtonComponent } from "@/structures";
import {
    ButtonInteraction,
    ButtonBuilder,
    ButtonStyle,
    LocaleString
} from "discord.js";
import { BotPermissionsBitField, LanguageManager } from "@/classes";

export default class WordSnakeChannelConfirmButtonComponent extends ButtonComponent {
    public static readonly builder = new ButtonBuilder()
        .setCustomId("countingChannelConfirm")
        .setLabel("placeholder")
        .setStyle(ButtonStyle.Success);

    constructor() {
        super({
            builder: WordSnakeChannelConfirmButtonComponent.builder
        });
    }

    public static getTranslatedBuilder(
        locale: LocaleString,
        langManager: LanguageManager
    ): ButtonBuilder {
        return new ButtonBuilder(this.builder.toJSON()).setLabel(
            langManager.getString(locale, "misc.confirm")
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

        await this.client.prisma.guildSettings.updateMany({
            where: {
                type: "WORD_SNAKE_CHANNEL",
                Guild: { discordId: i.guild!.id }
            },
            data: { value: context.channelId }
        });
        await this.client.prisma.guildSettings.deleteMany({
            where: {
                type: {
                    in: [
                        "CURRENT_WORD_SNAKE",
                        "CURRENT_WORD",
                        "CURRENT_WORD_USER"
                    ]
                },
                Guild: { discordId: i.guild!.id }
            }
        });
        this.client.redis.delGuildSettings("wordSnake", i.guild!.id);
        this.client.redis.delMessageContext(
            "wordSnakeChannelSet",
            i.message.id
        );

        this.client.sender.reply(
            i,
            { components: [] },
            {
                langLocation: "wordSnake.channelSet",
                langVariables: { channel: `<#${context.channelId}>` },
                msgType: "SUCCESS",
                method: "UPDATE"
            }
        );

        return { result: "SUCCESS" };
    }
}
