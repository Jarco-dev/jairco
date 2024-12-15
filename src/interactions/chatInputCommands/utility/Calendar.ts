import { HandlerResult } from "@/types";
import { ChatInputCommand } from "@/structures";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ChatInputCommandInteraction,
    SlashCommandBuilder
} from "discord.js";
import { BotPermissionsBitField } from "@/classes";
import CalendarEventsPreviousPageButtonComponent from "@/button/fun/CalendarEventsPreviousPage";
import CalendarEventsSelectPageStartButtonComponent from "@/button/fun/CalendarEventsSelectPageStart";
import CalendarEventsNextPageButtonComponent from "@/button/fun/CalendarEventsNextPage";
import moment from "moment";

export default class CalendarChatInputCommand extends ChatInputCommand {
    constructor() {
        super({
            builder: new SlashCommandBuilder()
                .setName("calendar")
                .setNameLocalization("nl", "kalender")
                .setDescription(
                    "A calendar to keep track of events happening in the server"
                )
                .setDescriptionLocalization(
                    "nl",
                    "Een kalender om bij te houden welke evenementen er plaatsvinden in de server"
                )
                .setDMPermission(false)
                .addSubcommand(builder =>
                    builder
                        .setName("set-enabled")
                        .setNameLocalization("nl", "zet-ingeschakeld")
                        .setDescription(
                            "Enable or disable the calendar feature"
                        )
                        .setDescriptionLocalization(
                            "nl",
                            "Zet de kalender functie aan of uit"
                        )
                        .addStringOption(builder =>
                            builder
                                .setName("value")
                                .setNameLocalization("nl", "waarde")
                                .setDescription("The value")
                                .setDescriptionLocalization("nl", "De waarde")
                                .setRequired(true)
                                .addChoices([
                                    {
                                        name: "Yes",
                                        name_localizations: { nl: "Ja" },
                                        value: "true"
                                    },
                                    {
                                        name: "No",
                                        name_localizations: { nl: "Nee" },
                                        value: "false"
                                    }
                                ])
                        )
                )
                .addSubcommand(builder =>
                    builder
                        .setName("set-auto-delete")
                        .setNameLocalization(
                            "nl",
                            "zet-automatisch-verwijderen"
                        )
                        .setDescription(
                            "Enable or disable the calendar auto delete feature"
                        )
                        .setDescriptionLocalization(
                            "nl",
                            "Zet de kalender automatisch verwijderen functie aan of uit"
                        )
                        .addStringOption(builder =>
                            builder
                                .setName("value")
                                .setNameLocalization("nl", "waarde")
                                .setDescription("The value")
                                .setDescriptionLocalization("nl", "De waarde")
                                .setRequired(true)
                                .addChoices([
                                    {
                                        name: "Yes",
                                        name_localizations: { nl: "Ja" },
                                        value: "true"
                                    },
                                    {
                                        name: "No",
                                        name_localizations: { nl: "Nee" },
                                        value: "false"
                                    }
                                ])
                        )
                )
                .addSubcommand(builder =>
                    builder
                        .setName("add")
                        .setNameLocalization("nl", "toevoegen")
                        .setDescription("Add a event to the calendar")
                        .setDescriptionLocalization(
                            "nl",
                            "Voeg een evenement toe aan de kalender"
                        )
                        .addStringOption(builder =>
                            builder
                                .setName("date")
                                .setNameLocalization("nl", "datum")
                                .setDescription(
                                    "When does the event take place?"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Wanneer vind het evenement plaats?"
                                )
                                .setRequired(true)
                        )
                        .addStringOption(builder =>
                            builder
                                .setName("description")
                                .setNameLocalization("nl", "beschrijving")
                                .setDescription(
                                    "A brief description of the event"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Een korte beschrijving van het evenement"
                                )
                                .setRequired(true)
                        )
                        .addStringOption(builder =>
                            builder
                                .setName("organisers")
                                .setNameLocalization("nl", "organisatoren")
                                .setDescription(
                                    "Who will host and or organize the event?"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Wie zullen het evenement hosten en/of organiseren?"
                                )
                                .setRequired(true)
                        )
                        .addStringOption(builder =>
                            builder
                                .setName("end-date")
                                .setNameLocalization("nl", "einddatum")
                                .setDescription(
                                    "The last (or only) day the event takes place (formated like dd/mm/yyyy)"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "De laatste (of enigste) dag waarop het evenement plaats vind (geformatteerd als dd/mm/jjjj)"
                                )
                        )
                )
                .addSubcommand(builder =>
                    builder
                        .setName("remove")
                        .setNameLocalization("nl", "verwijder")
                        .setDescription("Remove a event from the calendar")
                        .setDescriptionLocalization(
                            "nl",
                            "Verwijder een evenement van de kalender"
                        )
                        .addNumberOption(builder =>
                            builder
                                .setName("event-id")
                                .setNameLocalization("nl", "evenement-id")
                                .setDescription(
                                    "The id of the event to remove, get the id using /calendar view"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Het id van het evenement om te verwijderen, verkrijg het id met /calendar bekijken"
                                )
                                .setRequired(true)
                        )
                )
                .addSubcommand(builder =>
                    builder
                        .setName("view")
                        .setNameLocalization("nl", "bekijken")
                        .setDescription("View the events in the calendar")
                        .setDescriptionLocalization(
                            "nl",
                            "Bekijk de evenementen in de kalender"
                        )
                        .addBooleanOption(builder =>
                            builder
                                .setName("with-old-events")
                                .setNameLocalization(
                                    "nl",
                                    "met-oude-evenementen"
                                )
                                .setDescription("With old events")
                                .setDescriptionLocalization(
                                    "nl",
                                    "Met oude evenementen"
                                )
                        )
                )
        });
    }

    public async run(i: ChatInputCommandInteraction): Promise<HandlerResult> {
        const key = `${
            i.options.getSubcommandGroup()
                ? `${i.options.getSubcommandGroup()}.`
                : ""
        }${i.options.getSubcommand()}`;

        if (key !== "set-enabled") {
            const settings =
                await this.client.cacheableData.getCalendarSettings(
                    i.guild!.id
                );
            if (!settings?.calendarEnabled) {
                this.client.sender.reply(
                    i,
                    { ephemeral: true },
                    {
                        langLocation: "misc.featureDisabled",
                        msgType: "INVALID"
                    }
                );
                return { result: "FEATURE_DISABLED" };
            }
        }

        switch (key) {
            case "set-enabled":
                return this.runSetEnabled(i);
            case "set-auto-delete":
                return this.runSetAutoDelete(i);
            case "add":
                return this.runAdd(i);
            case "remove":
                return this.runRemove(i);
            case "view":
                return this.runView(i);

            default:
                return {
                    result: "ERRORED",
                    note: "Calendar subcommand executor not found",
                    error: new Error("Command executor not found")
                };
        }
    }

    private async runSetEnabled(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (!permissions.has(BotPermissionsBitField.Flags.ConfigureCalendar)) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const settings = await this.client.cacheableData.getCalendarSettings(
            i.guild!.id
        );
        const newValue = i.options.getString("value", true) === "true";
        if (settings?.calendarEnabled === newValue) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: newValue
                        ? "misc.featureAlreadyEnabled"
                        : "misc.featureAlreadyDisabled",
                    msgType: "INVALID"
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        if (settings?.calendarEnabled !== undefined) {
            await this.client.prisma.guildSettings.updateMany({
                where: {
                    type: "CALENDAR_ENABLED",
                    Guild: { discordId: i.guild!.id }
                },
                data: { value: newValue ? "1" : "0" }
            });
        } else {
            await this.client.prisma.guildSettings.create({
                data: {
                    type: "CALENDAR_ENABLED",
                    guildIdAndType: i.guild!.id + "CALENDAR_ENABLED",
                    value: newValue ? "1" : "0",
                    Guild: {
                        connectOrCreate: {
                            where: { discordId: i.guild!.id },
                            create: { discordId: i.guild!.id }
                        }
                    }
                }
            });
        }
        await this.client.redis.delGuildSettings("calendar", i.guild!.id);

        this.client.sender.reply(
            i,
            {},
            {
                langLocation: newValue
                    ? "misc.featureNowEnabled"
                    : "misc.featureNowDisabled",
                msgType: "SUCCESS"
            }
        );

        return { result: "SUCCESS" };
    }

    private async runSetAutoDelete(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (!permissions.has(BotPermissionsBitField.Flags.ConfigureCalendar)) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const settings = await this.client.cacheableData.getCalendarSettings(
            i.guild!.id
        );
        const newValue = i.options.getString("value", true) === "true";
        if (settings?.calendarAutoDelete === newValue) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: newValue
                        ? "misc.featureAlreadyEnabled"
                        : "misc.featureAlreadyDisabled",
                    msgType: "INVALID"
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        if (settings?.calendarAutoDelete !== undefined) {
            await this.client.prisma.guildSettings.updateMany({
                where: {
                    type: "CALENDAR_AUTO_DELETE",
                    Guild: { discordId: i.guild!.id }
                },
                data: { value: newValue ? "1" : "0" }
            });
        } else {
            await this.client.prisma.guildSettings.create({
                data: {
                    type: "CALENDAR_AUTO_DELETE",
                    guildIdAndType: i.guild!.id + "CALENDAR_AUTO_DELETE",
                    value: newValue ? "1" : "0",
                    Guild: {
                        connectOrCreate: {
                            where: { discordId: i.guild!.id },
                            create: { discordId: i.guild!.id }
                        }
                    }
                }
            });
        }
        await this.client.redis.delGuildSettings("calendar", i.guild!.id);

        this.client.sender.reply(
            i,
            {},
            {
                langLocation: newValue
                    ? "misc.featureNowEnabled"
                    : "misc.featureNowDisabled",
                msgType: "SUCCESS"
            }
        );

        return { result: "SUCCESS" };
    }

    private async runAdd(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (!permissions.has(BotPermissionsBitField.Flags.AddToCalendar)) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const rawEndDate = i.options.getString("end-date");
        const endDate = moment(rawEndDate, ["DD/MM/YYYY", "DD-MM-YYYY"], true);
        if (rawEndDate && !endDate.isValid()) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "calendar.invalidEndDate", msgType: "INVALID" }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const date = i.options.getString("date", true);
        const description = i.options.getString("description", true);
        const organisers = i.options.getString("organisers", true);
        const event = await this.client.prisma.calendarEvents.create({
            data: {
                Guild: {
                    connectOrCreate: {
                        where: { discordId: i.guild!.id },
                        create: { discordId: i.guild!.id }
                    }
                },
                createdByUser: {
                    connectOrCreate: {
                        where: { discordId: i.guild!.id },
                        create: { discordId: i.guild!.id }
                    }
                },
                date,
                description,
                organisers,
                endDate: rawEndDate ? endDate.toDate() : undefined
            }
        });

        this.client.sender.reply(
            i,
            {},
            {
                langType: "EMBED",
                langLocation: "calendar.eventAddedEmbed",
                langVariables: {
                    id: event.id.toString(),
                    date,
                    endDate: event.endDate
                        ? `<t:${Math.ceil(
                              event.endDate.getTime() / 1000
                          ).toString()}:D>`
                        : "-",
                    organisers,
                    description
                }
            }
        );

        return { result: "SUCCESS" };
    }

    private async runRemove(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (!permissions.has(BotPermissionsBitField.Flags.RemoveFromCalendar)) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const eventId = i.options.getNumber("event-id", true);
        const event = await this.client.prisma.calendarEvents.findUnique({
            where: { Guild: { discordId: i.guild!.id }, id: eventId },
            select: {
                id: true,
                date: true,
                endDate: true,
                organisers: true,
                description: true
            }
        });
        if (!event) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "calendar.invalidEventId", msgType: "INVALID" }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        await this.client.prisma.calendarEvents.delete({
            where: { id: eventId }
        });
        this.client.sender.reply(
            i,
            {},
            {
                langType: "EMBED",
                langLocation: "calendar.eventRemovedEmbed",
                langVariables: {
                    id: event.id.toString(),
                    date: event.date,
                    endDate: event.endDate
                        ? `<t:${Math.ceil(
                              event.endDate.getTime() / 1000
                          ).toString()}:D>`
                        : "-",
                    organisers: event.organisers,
                    description: event.description
                }
            }
        );

        return { result: "SUCCESS" };
    }

    private async runView(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (!permissions.has(BotPermissionsBitField.Flags.ViewCalendar)) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const withOld = i.options.getBoolean("with-old-events") ?? false;
        const eventCount = await this.client.prisma.calendarEvents.count({
            where: {
                Guild: { discordId: i.guild!.id },
                ...(withOld
                    ? {}
                    : {
                          OR: [
                              { endDate: null },
                              {
                                  endDate: {
                                      gte: this.client.utils.getCalendarCutOffDate()
                                  }
                              }
                          ]
                      })
            }
        });
        const embed = await this.client.utils.getCalendarEventsPage(i, withOld);
        if (eventCount <= 5) {
            this.client.sender.reply(i, { embeds: [embed] });
            return { result: "SUCCESS" };
        }

        const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
            CalendarEventsPreviousPageButtonComponent.builder,
            new ButtonBuilder(
                CalendarEventsSelectPageStartButtonComponent.builder.toJSON()
            ).setLabel(`1/${Math.ceil(eventCount / 5)}`),
            CalendarEventsNextPageButtonComponent.builder
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
            return {
                result: "ERRORED",
                note: "Calendar events message unavailable",
                error: new Error("Message unavailable")
            };
        }

        this.client.redis.setMessageContext("calendarEvents", reply.id, {
            page: 1,
            pageMenuOwnerId: i.user.id,
            withOld
        });

        return { result: "SUCCESS" };
    }
}
