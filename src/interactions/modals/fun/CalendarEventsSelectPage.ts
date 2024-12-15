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
import CalendarEventsPreviousPageButtonComponent from "@/button/fun/CalendarEventsPreviousPage";
import CalendarEventsSelectPageStartButtonComponent from "@/button/fun/CalendarEventsSelectPageStart";
import CalendarEventsNextPageButtonComponent from "@/button/fun/CalendarEventsNextPage";

export default class CalendarEventsSelectPageModal extends Modal {
    public static readonly builder = new ModalBuilder()
        .setCustomId("calendarEventsSelectPage")
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
            builder: CalendarEventsSelectPageModal.builder
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
            "calendarEvents",
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
            where: {
                Guild: { discordId: i.guild!.id },
                ...context.withOld ? {} : ({
                    OR: [
                        { endDate: null },
                        { endDate: { gte: this.client.utils.getCalendarCutOffDate() } }
                    ]
                })
            }
        });
        if (eventCount === 0) {
            this.client.redis.delMessageContext(
                "calendarEvents",
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

        const maxPage = Math.ceil(eventCount / 5);
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

        const embed = await this.client.utils.getCalendarEventsPage(i, context.withOld, newPage);
        const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
            CalendarEventsPreviousPageButtonComponent.builder,
            new ButtonBuilder(
                CalendarEventsSelectPageStartButtonComponent.builder.data
            ).setLabel(`${newPage}/${maxPage}`),
            CalendarEventsNextPageButtonComponent.builder
        );

        const reply = await this.client.sender.reply(i, {
            embeds: [embed],
            components: eventCount > 5 ? [buttons] : [],
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
                note: "Calendar events page message unavailable",
                error: new Error("Message unavailable")
            };
        }

        i.message!.delete().catch(() => {});
        if (eventCount > 5) {
            this.client.redis.delMessageContext(
                "calendarEvents",
                i.message!.id
            );
            this.client.redis.setMessageContext("calendarEvents", reply.id, {
                ...context,
                page: newPage
            });
        } else {
            this.client.redis.delMessageContext(
                "calendarEvents",
                i.message!.id
            );
        }

        return { result: "SUCCESS" };
    }
}
