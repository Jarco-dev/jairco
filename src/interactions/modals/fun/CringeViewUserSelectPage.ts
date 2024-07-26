import { HandlerResult } from "@/types";
import { Modal } from "@/structures";
import {
    ModalSubmitInteraction,
    ModalBuilder,
    LocaleString,
    TextInputStyle,
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    TextInputBuilder,
    ButtonBuilder
} from "discord.js";
import { LanguageManager } from "@/classes";
import CringeListPreviousPageButtonComponent from "@/button/fun/CringeViewUserPreviousPage";
import CringeViewUserSelectPageStartButtonComponent from "@/button/fun/CringeViewUserSelectPageStart";
import CringeViewUserNextPageButtonComponent from "@/button/fun/CringeViewUserNextPage";

export default class CringeViewUserSelectPageModal extends Modal {
    public static readonly builder = new ModalBuilder()
        .setCustomId("cringeViewUserSelectPage")
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
            builder: CringeViewUserSelectPageModal.builder
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
            "cringeViewUser",
            i.message!.id
        );
        if (!context) {
            const buttons = new ActionRowBuilder<ButtonBuilder>(i.message!.components[0].toJSON())
            buttons.components.forEach(b => b.setDisabled(true));
            i.message!.edit({ embeds: i.message!.embeds, components: [buttons] }).catch(() => {});

            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "misc.pageMenuUnavailable",
                    msgType: "INVALID"
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

        const user = await this.client.users.fetch(context.userId);
        const cringeCount =
            context.type === "received"
                ? await this.client.prisma.cringes.count({
                      where: {
                          Guilds: { discordId: i.guild!.id },
                          ReceivedByUser: { discordId: user.id }
                      }
                  })
                : await this.client.prisma.cringes.count({
                      where: {
                          Guilds: { discordId: i.guild!.id },
                          GivenByUser: { discordId: user.id }
                      }
                  });
        if (cringeCount === 0) {
            this.client.redis.delMessageContext(
                "cringeLeaderboard",
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

        const maxPage = Math.ceil(cringeCount / 10);
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

        const embed = await this.client.utils.getViewUserCringesPage(
            i,
            user,
            context.type,
            cringeCount,
            newPage
        );
        const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
            CringeListPreviousPageButtonComponent.builder,
            new ButtonBuilder(
                CringeViewUserSelectPageStartButtonComponent.builder.data
            ).setLabel(`${newPage}/${maxPage}`),
            CringeViewUserNextPageButtonComponent.builder
        );

        const reply = await this.client.sender.reply(i, {
            embeds: [embed],
            components: [buttons],
            fetchReply: true
        });
        if (!reply) {
            this.client.sender.reply(
                i,
                {},
                { msgType: "ERROR", langLocation: "misc.somethingWentWrong" }
            );
            i.message!.delete().catch(() => {});
            return {
                result: "ERRORED",
                note: "Cringe list select page message unavailable",
                error: new Error("Message unavailable")
            };
        }

        i.message!.delete().catch(() => {});
        if (cringeCount > 10) {
            this.client.redis.delMessageContext(
                "cringeViewUser",
                i.message!.id
            );
            this.client.redis.setMessageContext("cringeViewUser", reply.id, {
                ...context,
                page: newPage
            });
        } else {
            this.client.redis.delMessageContext(
                "cringeViewUser",
                i.message!.id
            );
        }

        return { result: "SUCCESS" };
    }
}
