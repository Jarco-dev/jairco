import { HandlerResult } from "@/types";
import { ButtonComponent } from "@/structures";
import {
    ButtonInteraction,
    ButtonBuilder,
    LocaleString,
    ButtonStyle
} from "discord.js";
import { BotPermissionsBitField, LanguageManager } from "@/classes";

export default class CringeResetConfirmButtonComponent extends ButtonComponent {
    public static readonly builder = new ButtonBuilder()
        .setCustomId("cringeResetConfirm")
        .setLabel("placeholder")
        .setStyle(ButtonStyle.Success);

    constructor() {
        super({
            builder: CringeResetConfirmButtonComponent.builder
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
            "cringeReset",
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

        if (context.type === "received") {
            await this.client.prisma.cringes.deleteMany({
                where: {
                    Guild: { discordId: i.guild!.id },
                    ReceivedByUser: { discordId: context.userId }
                }
            });
        } else if (context.type === "given") {
            await this.client.prisma.cringes.deleteMany({
                where: {
                    Guild: { discordId: i.guild!.id },
                    GivenByUser: { discordId: context.userId }
                }
            });
        }
        this.client.redis.delMessageContext("cringeDelete", i.message.id);

        this.client.sender.reply(
            i,
            { components: [] },
            {
                langLocation:
                    context.type === "received"
                        ? "cringe.cringeReceivedWasReset"
                        : "cringe.cringeReceivedWasReset",
                langVariables: { user: `<@${context.userId}>` },
                msgType: "SUCCESS",
                method: "UPDATE"
            }
        );

        return { result: "SUCCESS" };
    }
}
