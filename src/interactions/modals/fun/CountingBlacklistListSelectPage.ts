import { HandlerResult } from "@/types";
import { Modal } from "@/structures";
import {
    ModalSubmitInteraction,
    ModalBuilder,
    LocaleString,
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    TextInputBuilder,
    TextInputStyle,
    ButtonBuilder
} from "discord.js";
import { BotPermissionsBitField, LanguageManager } from "@/classes";
import CountingBlacklistListPreviousPageButtonComponent from "@/button/fun/CountingBlacklistListPreviousPage";
import CountingBlacklistListSelectPageStartButtonComponent from "@/button/fun/CountingBlacklistListSelectPageStart";
import CountingBlacklistListNextPageButtonComponent from "@/button/fun/CountingBlacklistListNextPage";

export default class CountingBlacklistListSelectPageModal extends Modal {
    public static readonly builder = new ModalBuilder()
        .setCustomId("countingBlacklistListSelectPage")
        .setTitle("placeholder")
        .setComponents([
            new ActionRowBuilder<ModalActionRowComponentBuilder>().setComponents(
                new TextInputBuilder()
                    .setCustomId("pageNumber")
                    .setStyle(TextInputStyle.Short)
                    .setLabel("placeholder")
            )
        ]);

    constructor() {
        super({
            builder: CountingBlacklistListSelectPageModal.builder
        });
    }

    public static getTranslatedBuilder(
        locale: LocaleString,
        langManager: LanguageManager
    ): ModalBuilder {
        const modal = new ModalBuilder(this.builder.toJSON()).setTitle(
            langManager.getString(locale, "misc.selectAPage")
        );
        modal.components[0].components[0].setLabel(
            langManager.getString(locale, "misc.pageNumber")
        );
        return modal;
    }

    public async run(i: ModalSubmitInteraction): Promise<HandlerResult> {
        const context = await this.client.redis.getMessageContext(
            "countingBlacklistList",
            i.message!.id
        );
        if (!context) {
            const buttons = new ActionRowBuilder<ButtonBuilder>(
                i.message!.components[0].toJSON()
            );
            buttons.components.forEach(b => b.setDisabled(true));
            i.message!.edit({
                embeds: i.message!.embeds,
                components: [buttons]
            }).catch(() => {});

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

        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (
            !permissions.has(
                BotPermissionsBitField.Flags.ManageCountingBlacklist
            ) ||
            i.user.id !== context.pageMenuOwnerId
        ) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const blacklistCount = await this.client.prisma.blacklists.count({
            where: { type: "COUNTING", Guild: { discordId: i.guild!.id } }
        });
        if (blacklistCount === 0) {
            this.client.redis.delMessageContext(
                "countingBlacklistList",
                i.message!.id
            );
            this.client.sender.reply(
                i,
                { ephemeral: true, components: [] },
                {
                    langLocation: "misc.pageMenuUnavailable",
                    msgType: "INVALID"
                }
            );
            i.message!.delete().catch(() => {});
            return { result: "OTHER", note: "Menu no longer has any entries" };
        }

        const maxPage = Math.ceil(blacklistCount / 10);
        const newPage = parseInt(i.fields.getTextInputValue("pageNumber"));
        if (isNaN(newPage) || newPage > maxPage) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "misc.invalidPage",
                    langVariables: { maxPage: maxPage.toString() },
                    msgType: "INVALID"
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const embed = await this.client.utils.getCountingBlacklistListPage(
            i,
            newPage
        );
        const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
            CountingBlacklistListPreviousPageButtonComponent.builder,
            new ButtonBuilder(
                CountingBlacklistListSelectPageStartButtonComponent.builder.data
            ).setLabel(`${newPage}/${maxPage}`),
            CountingBlacklistListNextPageButtonComponent.builder
        );

        const reply = await this.client.sender.reply(i, {
            embeds: [embed],
            components: blacklistCount > 10 ? [buttons] : [],
            fetchReply: true
        });
        if (!reply) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { msgType: "ERROR", langLocation: "misc.somethingWentWrong" }
            );
            i.message!.delete().catch(() => {});
            return {
                result: "ERRORED",
                note: "Counting blacklist list page message unavailable",
                error: new Error("Message unavailable")
            };
        }

        i.message!.delete().catch(() => {});
        if (blacklistCount > 10) {
            this.client.redis.delMessageContext(
                "countingBlacklistList",
                i.message!.id
            );
            this.client.redis.setMessageContext(
                "countingBlacklistList",
                reply.id,
                {
                    ...context,
                    page: newPage
                }
            );
        } else {
            this.client.redis.delMessageContext(
                "countingBlacklistList",
                i.message!.id
            );
        }

        return { result: "SUCCESS" };
    }
}
