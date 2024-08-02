import { HandlerResult } from "@/types";
import { ButtonComponent } from "@/structures";
import {
    ButtonInteraction,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} from "discord.js";
import CountingLeaderboardSelectPageStartButtonComponent from "@/button/fun/CountingLeaderboardSelectPageStart";
import CountingLeaderboardNextPageButtonComponent from "@/button/fun/CountingLeaderboardNextPage";

export default class CountingLeaderboardPreviousPageButtonComponent extends ButtonComponent {
    public static readonly builder = new ButtonBuilder()
        .setCustomId("countingLeaderboardPreviousPage")
        .setStyle(ButtonStyle.Success)
        .setLabel("<");

    constructor() {
        super({
            builder: CountingLeaderboardPreviousPageButtonComponent.builder
        });
    }

    public async run(i: ButtonInteraction): Promise<HandlerResult> {
        const context = await this.client.redis.getMessageContext(
            "countingLeaderboard",
            i.message.id
        );
        if (!context) {
            const buttons = new ActionRowBuilder<ButtonBuilder>(
                i.message.components[0].toJSON()
            );
            buttons.components.forEach(b => b.setDisabled(true));
            await this.client.sender.reply(
                i,
                { embeds: i.message.embeds, components: [buttons] },
                { method: "UPDATE" }
            );

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
        if (i.user.id !== context.pageMenuOwnerId) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const userCount = await this.client.prisma.countingStats.count({
            where: {
                Guild: { discordId: i.guild!.id },
                ...(context.type === "correct"
                    ? { correct: { gt: 0 } }
                    : context.type === "incorrect"
                      ? { incorrect: { gt: 0 } }
                      : { highest: { gt: 0 } })
            }
        });
        if (userCount === 0) {
            this.client.redis.delMessageContext(
                "countingLeaderboard",
                i.message.id
            );
            this.client.sender.reply(
                i,
                { ephemeral: true, components: [] },
                {
                    langLocation: "misc.pageMenuUnavailable",
                    msgType: "INVALID",
                    method: "UPDATE"
                }
            );
            return { result: "OTHER", note: "Menu no longer has any entries" };
        }

        const maxPage = Math.ceil(userCount / 10);
        const newPage = context.page > 1 ? context.page - 1 : maxPage;
        const embed = await this.client.utils.getCountingLeaderboardPage(
            i,
            context.type,
            newPage
        );
        const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
            CountingLeaderboardPreviousPageButtonComponent.builder,
            new ButtonBuilder(
                CountingLeaderboardSelectPageStartButtonComponent.builder.data
            ).setLabel(`${newPage}/${maxPage}`),
            CountingLeaderboardNextPageButtonComponent.builder
        );

        this.client.sender.reply(
            i,
            {
                embeds: [embed],
                components: userCount > 10 ? [buttons] : []
            },
            { method: "UPDATE" }
        );
        if (userCount > 10) {
            this.client.redis.setMessageContext(
                "countingLeaderboard",
                i.message.id,
                { ...context, page: newPage }
            );
        } else {
            this.client.redis.delMessageContext(
                "countingLeaderboard",
                i.message.id
            );
        }

        return { result: "SUCCESS" };
    }
}
