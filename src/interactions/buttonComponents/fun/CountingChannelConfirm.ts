import { HandlerResult } from "@/types";
import { ButtonComponent } from "@/structures";
import {
    ButtonInteraction,
    ButtonBuilder,
    ButtonStyle,
    LocaleString
} from "discord.js";
import { BotPermissionsBitField, LanguageManager } from "@/classes";

export default class CountingChannelConfirmButtonComponent extends ButtonComponent {
    public static readonly builder = new ButtonBuilder()
        .setCustomId("countingChannelConfirm")
        .setLabel("placeholder")
        .setStyle(ButtonStyle.Success);

    constructor() {
        super({
            builder: CountingChannelConfirmButtonComponent.builder
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
            "countingChannelSet",
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

        const settings = await this.client.cacheableData.getCountingSettings(
            i.guild!.id
        );
        if (!settings?.countingEnabled) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.featureDisabled", msgType: "INVALID" }
            );
            return { result: "FEATURE_DISABLED" };
        }

        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (
            !permissions.has(BotPermissionsBitField.Flags.ManageCounting) ||
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
                type: "COUNTING_CHANNEL",
                Guild: { discordId: i.guild!.id }
            },
            data: { value: context.channelId }
        });
        this.client.redis.delGuildSettings("counting", i.guild!.id);
        this.client.redis.delMessageContext("countingChannelSet", i.message.id);

        this.client.sender.reply(
            i,
            { components: [] },
            {
                langLocation: "counting.channelSet",
                langVariables: { channel: `<#${context.channelId}>` },
                msgType: "SUCCESS",
                method: "UPDATE"
            }
        );

        return { result: "SUCCESS" };
    }
}
