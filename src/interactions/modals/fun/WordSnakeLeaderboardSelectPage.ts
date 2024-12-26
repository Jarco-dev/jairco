import { HandlerResult } from "@/types";
import { Modal } from "@/structures";
import {
    ModalSubmitInteraction,
    ModalBuilder,
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    TextInputBuilder,
    TextInputStyle,
    LocaleString,
    ButtonBuilder
} from "discord.js";
import { LanguageManager } from "@/classes";
import WordSnakeLeaderboardPreviousPageButtonComponent from "@/button/fun/wordSnake/WordSnakeLeaderboardPreviousPage";
import WordSnakeLeaderboardSelectPageStartButtonComponent from "@/button/fun/wordSnake/WordSnakeLeaderboardSelectPageStart";
import WordSnakeLeaderboardNextPageButtonComponent from "@/button/fun/wordSnake/WordSnakeLeaderboardNextPage";

export default class WordSnakeLeaderboardSelectPageModal extends Modal {
    public static readonly builder = new ModalBuilder()
        .setCustomId("wordSnakeLeaderboardSelectPage")
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
            builder: WordSnakeLeaderboardSelectPageModal.builder
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
            "wordSnakeLeaderboard",
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

        const userCount = await this.client.prisma.countingStats.count({
            where: {
                Guild: { discordId: i.guild!.id },
                ...(context.type === "correct"
                    ? { correct: { gt: 0 } }
                    : { incorrect: { gt: 0 } })
            }
        });
        if (userCount === 0) {
            this.client.redis.delMessageContext(
                "wordSnakeLeaderboard",
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

        const embed = await this.client.utils.getWordSnakeLeaderboardPage(
            i,
            context.type,
            newPage
        );
        const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
            WordSnakeLeaderboardPreviousPageButtonComponent.builder,
            new ButtonBuilder(
                WordSnakeLeaderboardSelectPageStartButtonComponent.builder.data
            ).setLabel(`${newPage}/${maxPage}`),
            WordSnakeLeaderboardNextPageButtonComponent.builder
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
                note: "Word snake leaderboard page message unavailable",
                error: new Error("Message unavailable")
            };
        }

        i.message!.delete().catch(() => {});
        if (userCount > 10) {
            this.client.redis.delMessageContext(
                "wordSnakeLeaderboard",
                i.message!.id
            );
            this.client.redis.setMessageContext(
                "wordSnakeLeaderboard",
                reply.id,
                {
                    ...context,
                    page: newPage
                }
            );
        } else {
            this.client.redis.delMessageContext(
                "wordSnakeLeaderboard",
                i.message!.id
            );
        }

        return { result: "SUCCESS" };
    }
}
