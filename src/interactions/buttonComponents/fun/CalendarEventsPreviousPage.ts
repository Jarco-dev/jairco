import { HandlerResult } from "@/types";
import { ButtonComponent } from "@/structures";
import {
    ButtonInteraction,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} from "discord.js";
import { BotPermissionsBitField } from "@/classes";
import CalendarEventsSelectPageStartButtonComponent from "@/button/fun/CalendarEventsSelectPageStart";
import CalendarEventsNextPageButtonComponent from "@/button/fun/CalendarEventsNextPage";

export default class CalendarEventsPreviousPageButtonComponent extends ButtonComponent {
    public static readonly builder = new ButtonBuilder()
        .setCustomId("calendarEventsPreviousPage")
        .setStyle(ButtonStyle.Success)
        .setLabel("<");

    constructor() {
        super({
            builder: CalendarEventsPreviousPageButtonComponent.builder
        });
    }

    public async run(i: ButtonInteraction): Promise<HandlerResult> {
        const context = await this.client.redis.getMessageContext(
            "calendarEvents",
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
            !permissions.has(BotPermissionsBitField.Flags.ViewCalendar) ||
            i.user.id !== context.pageMenuOwnerId
        ) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const eventCount = await this.client.prisma.calendarEvents.count({
            where: { Guild: { discordId: i.guild!.id } }
        });
        if (eventCount === 0) {
            this.client.redis.delMessageContext("calendarEvents", i.message.id);
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

        const maxPage = Math.ceil(eventCount / 5);
        const newPage = context.page > 1 ? context.page - 1 : maxPage;
        const embed = await this.client.utils.getCalendarEventsPage(i, newPage);
        const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
            CalendarEventsPreviousPageButtonComponent.builder,
            new ButtonBuilder(
                CalendarEventsSelectPageStartButtonComponent.builder.data
            ).setLabel(`${newPage}/${maxPage}`),
            CalendarEventsNextPageButtonComponent.builder
        );

        this.client.sender.reply(
            i,
            {
                embeds: [embed],
                components: eventCount > 5 ? [buttons] : []
            },
            { method: "UPDATE" }
        );
        if (eventCount > 5) {
            this.client.redis.setMessageContext(
                "calendarEvents",
                i.message.id,
                { ...context, page: newPage }
            );
        } else {
            this.client.redis.delMessageContext("calendarEvents", i.message.id);
        }

        return { result: "SUCCESS" };
    }
}
