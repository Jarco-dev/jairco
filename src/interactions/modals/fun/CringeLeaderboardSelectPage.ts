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
import { LanguageManager } from "@/classes";
import CringeLeaderboardPreviousPageButtonComponent from "@/button/fun/CringeLeaderboardPreviousPage";
import CringeLeaderboardSelectPageStartButtonComponent from "@/button/fun/CringeLeaderboardSelectPageStart";
import CringeLeaderboardNextPageButtonComponent from "@/button/fun/CringeLeaderboardNextPage";

export default class CringeLeaderboardSelectPageModal extends Modal {
    public static readonly builder = new ModalBuilder()
        .setCustomId("cringeLeaderboardSelectPage")
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
            builder: CringeLeaderboardSelectPageModal.builder
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
            "cringeLeaderboard",
            i.message!.id
        );
        if (!context) {
            this.client.sender.reply(
                i,
                { ephemeral: true, components: [] },
                {
                    langLocation: "misc.actionExpired",
                    msgType: "INVALID"
                }
            );
            i.message!.delete().catch(() => {});
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

        const dbRes: [{ received: bigint; given: bigint }] = await this.client
            .prisma
            .$queryRaw`SELECT COUNT(DISTINCT receivedByUserId) as received, COUNT(DISTINCT givenByUserId) as given FROM Cringes`;
        const userCount =
            context.type === "received"
                ? Number(dbRes[0].received)
                : Number(dbRes[0].given);
        if (userCount === 0) {
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

        const maxPage = Math.ceil(userCount / 10);
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

        const embed = await this.client.utils.getCringeLeaderboardPage(
            i,
            context.type,
            newPage
        );
        const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
            CringeLeaderboardPreviousPageButtonComponent.builder,
            new ButtonBuilder(
                CringeLeaderboardSelectPageStartButtonComponent.builder.toJSON()
            ).setLabel(`${newPage}/${maxPage}`),
            CringeLeaderboardNextPageButtonComponent.builder
        );

        const reply = await this.client.sender.reply(i, {
            embeds: [embed],
            components: userCount > 10 ? [buttons] : [],
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
                note: "Cringe leaderboard select page message unavailable",
                error: new Error("Message unavailable")
            };
        }

        i.message!.delete().catch(() => {});
        if (userCount > 10) {
            this.client.redis.delMessageContext(
                "cringeLeaderboard",
                i.message!.id
            );
            this.client.redis.setMessageContext("cringeLeaderboard", reply.id, {
                ...context,
                page: newPage
            });
        } else {
            this.client.redis.delMessageContext(
                "cringeLeaderboard",
                i.message!.id
            );
        }

        return { result: "SUCCESS" };
    }
}
