import { HandlerResult } from "@/types";
import { ButtonComponent } from "@/structures";
import {
    ButtonInteraction,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} from "discord.js";
import CountingBlacklistListSelectPageStartButtonComponent from "@/button/fun/counting/CountingBlacklistListSelectPageStart";
import CountingBlacklistListNextPageButtonComponent from "@/button/fun/counting/CountingBlacklistListNextPage";
import { BotPermissionsBitField } from "@/classes";

export default class CountingBlacklistListPreviousPageButtonComponent extends ButtonComponent {
    public static readonly builder = new ButtonBuilder()
        .setCustomId("countingBlacklistListPreviousPage")
        .setStyle(ButtonStyle.Success)
        .setLabel("<");

    constructor() {
        super({
            builder: CountingBlacklistListPreviousPageButtonComponent.builder
        });
    }

    public async run(i: ButtonInteraction): Promise<HandlerResult> {
        const context = await this.client.redis.getMessageContext(
            "countingBlacklistList",
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

        const maxPage = Math.ceil(blacklistCount / 10);
        const newPage = context.page > 1 ? context.page - 1 : maxPage;
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

        this.client.sender.reply(
            i,
            {
                embeds: [embed],
                components: blacklistCount > 10 ? [buttons] : []
            },
            { method: "UPDATE" }
        );
        if (blacklistCount > 10) {
            this.client.redis.setMessageContext(
                "countingBlacklistList",
                i.message.id,
                { ...context, page: newPage }
            );
        } else {
            this.client.redis.delMessageContext(
                "countingBlacklistList",
                i.message.id
            );
        }

        return { result: "SUCCESS" };
    }
}
