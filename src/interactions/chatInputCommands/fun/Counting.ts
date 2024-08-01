import { HandlerResult } from "@/types";
import { ChatInputCommand } from "@/structures";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ChannelType,
    ChatInputCommandInteraction,
    GuildTextBasedChannel,
    SlashCommandBuilder
} from "discord.js";
import { BotPermissionsBitField } from "@/classes";
import CountingChannelConfirmButtonComponent from "@/button/fun/CountingChannelConfirm";
import CountingChannelCancelButtonComponent from "@/button/fun/CountingChannelCancel";
import CountingBlacklistListNextPageButtonComponent from "@/button/fun/CountingBlacklistListNextPage";
import CountingBlacklistListSelectPageStartButtonComponent from "@/button/fun/CountingBlacklistListSelectPageStart";
import CountingBlacklistListPreviousPageButtonComponent from "@/button/fun/CountingBlacklistListPreviousPage";
import CountingLeaderboardPreviousPageButtonComponent from "@/button/fun/CountingLeaderboardPreviousPage";
import CountingLeaderboardSelectPageStartButtonComponent from "@/button/fun/CountingLeaderboardSelectPageStart";
import CountingLeaderboardNextPageButtonComponent from "@/button/fun/CountingLeaderboardNextPage";

export default class CountingChatInputCommand extends ChatInputCommand {
    constructor() {
        super({
            builder: new SlashCommandBuilder()
                .setName("counting")
                .setNameLocalization("nl", "tellen")
                .setDescription("Everything to do with counting")
                .setDescriptionLocalization("nl", "Alles temaken met tellen")
                .setDMPermission(false)
                .addSubcommand(builder =>
                    builder
                        .setName("set-enabled")
                        .setNameLocalization("nl", "zet-ingeschakeld")
                        .setDescription(
                            "Enable or disable the counting feature"
                        )
                        .setDescriptionLocalization(
                            "nl",
                            "Zet de tellen functie aan of uit"
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
                        .setName("statistics")
                        .setNameLocalization("nl", "statistieken")
                        .setDescription("View counting statistics for the server")
                        .setDescriptionLocalization("nl", "Bekijk statistieken voor tellen van de hele server")
                )
                .addSubcommand(builder =>
                    builder
                        .setName("leaderboard")
                        .setNameLocalization("nl", "scoreboard")
                        .setDescription("View a list of the highest scores")
                        .setDescriptionLocalization(
                            "nl",
                            "Bekijk een lijst van de hoogste scores"
                        )
                        .addStringOption(builder =>
                            builder
                                .setName("type")
                                .setNameLocalization("nl", "type")
                                .setDescription("The leaderboard type")
                                .setDescriptionLocalization(
                                    "nl",
                                    "Het type scoreboard"
                                )
                                .setRequired(true)
                                .addChoices([
                                    {
                                        name: "Correctly counted",
                                        name_localizations: {
                                            nl: "Correct geteld"
                                        },
                                        value: "correct"
                                    },
                                    {
                                        name: "Incorrectly counted",
                                        name_localizations: {
                                            nl: "Incorrect geteld"
                                        },
                                        value: "incorrect"
                                    },
                                    {
                                        name: "Highest counted",
                                        name_localizations: {
                                            nl: "Hoogste geteld"
                                        },
                                        value: "highest"
                                    }
                                ])
                        )
                )
                .addSubcommandGroup(builder =>
                    builder
                        .setName("channel")
                        .setNameLocalization("nl", "kanaal")
                        .setDescription("Configure the counting channel")
                        .setDescriptionLocalization(
                            "nl",
                            "Instellingen voor het tellen kanaal"
                        )
                        .addSubcommand(builder =>
                            builder
                                .setName("set")
                                .setNameLocalization("nl", "instellen")
                                .setDescription("Set the counting channel")
                                .setDescriptionLocalization(
                                    "nl",
                                    "Selecteer het tellen kanaal"
                                )
                                .addChannelOption(builder =>
                                    builder
                                        .setName("channel")
                                        .setNameLocalization("nl", "kanaal")
                                        .setDescription("The channel")
                                        .setDescriptionLocalization(
                                            "nl",
                                            "Het kanaal"
                                        )
                                        .addChannelTypes(ChannelType.GuildText)
                                        .setRequired(true)
                                )
                        )
                        .addSubcommand(builder =>
                            builder
                                .setName("view")
                                .setNameLocalization("nl", "bekijk")
                                .setDescription(
                                    "View the current counting channel"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Bekijk het huidige tellen kanaal"
                                )
                        )
                        .addSubcommand(builder =>
                            builder
                                .setName("reset")
                                .setNameLocalization("nl", "resetten")
                                .setDescription(
                                    "Delete the configured channel and the current count"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Verwijder het ingestelde kanaal en het huidige nummer"
                                )
                        )
                )
                .addSubcommandGroup(builder =>
                    builder
                        .setName("blacklist")
                        .setNameLocalization("nl", "blokkades")
                        .setDescription("Manage counting blacklists")
                        .setDescriptionLocalization(
                            "nl",
                            "Beheer tellen blokkades"
                        )
                        .addSubcommand(builder =>
                            builder
                                .setName("add")
                                .setNameLocalization("nl", "toevoegen")
                                .setDescription(
                                    "Blacklist a user from counting"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Blokkeer een gebruiker van tellen"
                                )
                                .addUserOption(builder =>
                                    builder
                                        .setName("user")
                                        .setNameLocalization("nl", "gebruiker")
                                        .setDescription("The user")
                                        .setDescriptionLocalization(
                                            "nl",
                                            "De gebruiker"
                                        )
                                        .setRequired(true)
                                )
                                .addStringOption(builder =>
                                    builder
                                        .setName("reason")
                                        .setNameLocalization("nl", "reden")
                                        .setDescription(
                                            "The reason for the blacklist"
                                        )
                                        .setDescriptionLocalization(
                                            "nl",
                                            "De reden voor de blokkade"
                                        )
                                )
                        )
                        .addSubcommand(builder =>
                            builder
                                .setName("remove")
                                .setNameLocalization("nl", "verwijderen")
                                .setDescription(
                                    "Undo a blacklist for a user from counting"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Deblokkeer een gebruiker van tellen"
                                )
                                .addUserOption(builder =>
                                    builder
                                        .setName("user")
                                        .setNameLocalization("nl", "gebruiker")
                                        .setDescription("The user")
                                        .setDescriptionLocalization(
                                            "nl",
                                            "De gebruiker"
                                        )
                                        .setRequired(true)
                                )
                        )
                        .addSubcommand(builder =>
                            builder
                                .setName("list")
                                .setNameLocalization("nl", "lijst")
                                .setDescription(
                                    "View a list of all counting blacklists"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Bekijk een lijst van alle tellen blokkades"
                                )
                        )
                        .addSubcommand(builder =>
                            builder
                                .setName("view")
                                .setNameLocalization("nl", "bekijk")
                                .setDescription("View a specific blacklist")
                                .setDescriptionLocalization(
                                    "nl",
                                    "Bekijk een specifieke blokkade"
                                )
                                .addNumberOption(builder =>
                                    builder
                                        .setName("blacklist-id")
                                        .setNameLocalization(
                                            "nl",
                                            "blokkade-id"
                                        )
                                        .setDescription(
                                            "The id of the blacklist to delete, get the id using /counting blacklist list"
                                        )
                                        .setDescriptionLocalization(
                                            "nl",
                                            "Het id van de blokkade om te verwijderen, verkrijg het id met /counting blacklist list"
                                        )
                                        .setRequired(true)
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
                await this.client.cacheableData.getCountingSettings(
                    i.guild!.id
                );
            if (!settings?.countingEnabled) {
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
            case "statistics":
                return this.runStatistics(i);
            case "leaderboard":
                return this.runLeaderboard(i);

            case "channel.set":
                return this.runChannelSet(i);
            case "channel.view":
                return this.runChannelView(i);
            case "channel.reset":
                return this.runChannelReset(i);

            case "blacklist.add":
                return this.runBlacklistAdd(i);
            case "blacklist.remove":
                return this.runBlacklistRemove(i);
            case "blacklist.list":
                return this.runBlacklistList(i);
            case "blacklist.view":
                return this.runBlacklistView(i);

            default:
                return {
                    result: "ERRORED",
                    note: "Counting subcommand executor not found",
                    error: new Error("Command executor not found")
                };
        }
    }

    private async runSetEnabled(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (!permissions.has(BotPermissionsBitField.Flags.ManageCounting)) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const settings = await this.client.cacheableData.getCountingSettings(
            i.guild!.id
        );
        const newValue = i.options.getString("value", true) === "true";
        if (settings?.countingEnabled === newValue) {
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

        if (settings?.countingEnabled !== undefined) {
            await this.client.prisma.guildSettings.updateMany({
                where: {
                    type: "COUNTING_ENABLED",
                    Guild: { discordId: i.guild!.id }
                },
                data: { value: newValue ? "1" : "0" }
            });
        } else {
            await this.client.prisma.guildSettings.create({
                data: {
                    type: "COUNTING_ENABLED",
                    guildIdAndType: i.guild!.id + "COUNTING_ENABLED",
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
        await this.client.redis.delGuildSettings("counting", i.guild!.id);

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

    private async runStatistics(i: ChatInputCommandInteraction): Promise<HandlerResult> {
        const userCounts = await this.client.prisma.countingStats.aggregate({
            where: { Guild: { discordId: i.guild!.id } },
            _sum: { correct: true, incorrect: true }
        });
        const usersCounted = await this.client.prisma.countingStats.count({
            where: {
                Guild: { discordId: i.guild!.id },
                correct: { gt: 0 }
            }
        });
        const usersIncorrect = await this.client.prisma.countingStats.count({
            where: {
                Guild: { discordId: i.guild!.id },
                incorrect: { gt: 0 }
            }
        });
        const countingSettings = await this.client.cacheableData.getCountingSettings(i.guild!.id);

        this.client.sender.reply(i, {}, {
            langType: "EMBED",
            langLocation: "counting.statisticsEmbed",
            langVariables: {
                correct: (userCounts._sum.correct ?? 0).toString(),
                incorrect: (userCounts._sum.incorrect ?? 0).toString(),
                highest: (countingSettings?.highestCount ?? 0).toString(),
                usersCorrect: usersCounted.toString(),
                usersIncorrect: usersIncorrect.toString(),
            }
        });

        return { result: "SUCCESS" };
    }

    private async runLeaderboard(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const type = i.options.getString("type", true) as
            | "correct"
            | "incorrect"
            | "highest";
        const userCount = await this.client.prisma.countingStats.count({
            where: {
                Guild: { discordId: i.guild!.id },
                ...(type === "correct"
                    ? { correct: { gt: 0 } }
                    : type === "incorrect"
                      ? { incorrect: { gt: 0 } }
                      : { highest: { gt: 0 } })
            }
        });
        if (userCount === 0) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "counting.noUsersOnLeaderboard",
                    msgType: "INVALID"
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const embed = await this.client.utils.getCountingLeaderboardPage(
            i,
            type
        );
        if (userCount <= 10) {
            this.client.sender.reply(i, { embeds: [embed] });
            return { result: "SUCCESS" };
        }

        const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
            CountingLeaderboardPreviousPageButtonComponent.builder,
            new ButtonBuilder(
                CountingLeaderboardSelectPageStartButtonComponent.builder.toJSON()
            ).setLabel(`1/${Math.ceil(userCount / 10)}`),
            CountingLeaderboardNextPageButtonComponent.builder
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
                { langLocation: "misc.somethingWentWrong", msgType: "ERROR" }
            );
            return {
                result: "ERRORED",
                note: "Counting leaderboard message unavailable",
                error: new Error("Message unavailable")
            };
        }

        this.client.redis.setMessageContext("countingLeaderboard", reply.id, {
            pageMenuOwnerId: i.user.id,
            type,
            page: 1
        });

        return { result: "SUCCESS" };
    }

    private async runChannelSet(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (!permissions.has(BotPermissionsBitField.Flags.ManageCounting)) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const channel = i.options.getChannel(
            "channel",
            true
        ) as GuildTextBasedChannel;
        const botMember = await i.guild!.members.fetch(this.client.user!.id);
        const missingPerms = this.client.utils.checkPermissions(
            botMember,
            ["ViewChannel", "SendMessages", "ManageMessages", "AddReactions"],
            channel
        );
        if (!missingPerms.hasAll) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langType: "EMBED",
                    langLocation: "counting.botMissingPermsEmbed",
                    langVariables: { channel: channel.toString() }
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const settings = await this.client.cacheableData.getCountingSettings(
            i.guild!.id
        );
        if (!settings?.countingChannel) {
            await this.client.prisma.guildSettings.create({
                data: {
                    type: "COUNTING_CHANNEL",
                    guildIdAndType: i.guild!.id + "COUNTING_CHANNEL",
                    value: channel.id,
                    Guild: {
                        connectOrCreate: {
                            where: { discordId: i.guild!.id },
                            create: { discordId: i.guild!.id }
                        }
                    }
                }
            });
            this.client.redis.delGuildSettings("counting", i.guild!.id);

            this.client.sender.reply(
                i,
                {},
                {
                    langLocation: "counting.channelSet",
                    langVariables: { channel: channel.toString() },
                    msgType: "SUCCESS"
                }
            );

            return { result: "SUCCESS" };
        }

        const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
            CountingChannelConfirmButtonComponent.getTranslatedBuilder(
                i.locale,
                this.client.lang
            ),
            CountingChannelCancelButtonComponent.getTranslatedBuilder(
                i.locale,
                this.client.lang
            )
        );

        const reply = await this.client.sender.reply(
            i,
            { components: [buttons], fetchReply: true },
            {
                langType: "EMBED",
                langLocation: "counting.channelConfirmEmbed",
                langVariables: {
                    oldChannel: `<#${settings.countingChannel}>`,
                    newChannel: channel.toString()
                }
            }
        );
        if (!reply) {
            this.client.sender.reply(
                i,
                {},
                { msgType: "ERROR", langLocation: "misc.somethingWentWrong" }
            );
            return {
                result: "ERRORED",
                note: "Counting channel message unavailable",
                error: new Error("Message unavailable")
            };
        }

        this.client.redis.setMessageContext("countingChannelSet", reply.id, {
            buttonOwnerId: i.user.id,
            channelId: channel.id
        });

        return { result: "SUCCESS" };
    }

    private async runChannelView(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (!permissions.has(BotPermissionsBitField.Flags.ManageCounting)) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const settings = await this.client.cacheableData.getCountingSettings(
            i.guild!.id
        );
        if (settings?.countingChannel) {
            this.client.sender.reply(
                i,
                {},
                {
                    langLocation: "counting.viewChannel",
                    langVariables: {
                        channel: `<#${settings.countingChannel}>`
                    },
                    msgType: "SUCCESS"
                }
            );
        } else {
            this.client.sender.reply(
                i,
                {},
                {
                    langLocation: "counting.noChannelSet",
                    msgType: "INVALID"
                }
            );
        }

        return { result: "SUCCESS" };
    }

    private async runChannelReset(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (!permissions.has(BotPermissionsBitField.Flags.ManageCounting)) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const settings = await this.client.cacheableData.getCountingSettings(
            i.guild!.id
        );
        if (!settings?.countingChannel) {
            this.client.sender.reply(
                i,
                {},
                {
                    langLocation: "counting.noChannelSet",
                    msgType: "INVALID"
                }
            );
            return { result: "OTHER", note: "No counting channel is set" };
        }

        await this.client.prisma.guildSettings.deleteMany({
            where: {
                type: {
                    in: [
                        "COUNTING_CHANNEL",
                        "CURRENT_COUNT",
                        "CURRENT_COUNT_USER"
                    ]
                }
            }
        });
        this.client.redis.delGuildSettings("counting", i.guild!.id);

        return { result: "SUCCESS" };
    }

    private async runBlacklistAdd(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (
            !permissions.has(
                BotPermissionsBitField.Flags.ManageCountingBlacklist
            )
        ) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const user = i.options.getUser("user", true);
        if (user.bot) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "counting.cantBlacklistBot",
                    msgType: "INVALID"
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const blacklist = await this.client.cacheableData.getBlacklist(
            "counting",
            i.guild!.id,
            user.id
        );
        if (blacklist) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "counting.alreadyBlacklisted",
                    langVariables: { user: user.toString() },
                    msgType: "INVALID"
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const reason = i.options.getString("reason");
        if (reason && reason.length > 255) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "counting.reasonTooLong", msgType: "INVALID" }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        await this.client.prisma.blacklists.create({
            data: {
                reason,
                type: "COUNTING",
                guildIdUserIdType: i.guild!.id + user.id + "COUNTING",
                Guild: {
                    connectOrCreate: {
                        where: { discordId: i.guild!.id },
                        create: { discordId: i.guild!.id }
                    }
                },
                ReceivedByUser: {
                    connectOrCreate: {
                        where: { discordId: user.id },
                        create: { discordId: user.id }
                    }
                },
                GivenByUser: {
                    connectOrCreate: {
                        where: { discordId: i.user.id },
                        create: { discordId: i.user.id }
                    }
                }
            }
        });

        this.client.sender.reply(
            i,
            {},
            {
                langLocation: "counting.blacklistAdded",
                langVariables: { user: user.toString() },
                msgType: "SUCCESS"
            }
        );

        return { result: "SUCCESS" };
    }

    private async runBlacklistRemove(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (
            !permissions.has(
                BotPermissionsBitField.Flags.ManageCountingBlacklist
            )
        ) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const user = i.options.getUser("user", true);
        if (user.bot) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "counting.cantBlacklistBot",
                    msgType: "INVALID"
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const blacklist = await this.client.cacheableData.getBlacklist(
            "counting",
            i.guild!.id,
            user.id
        );
        if (!blacklist) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "counting.notBlacklisted",
                    langVariables: { user: user.toString() },
                    msgType: "INVALID"
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        await this.client.prisma.blacklists.delete({
            where: { guildIdUserIdType: i.guild!.id + user.id + "COUNTING" }
        });
        this.client.redis.delBlacklist("counting", i.guild!.id, user.id);

        this.client.sender.reply(
            i,
            {},
            {
                langLocation: "counting.blacklistRemoved",
                langVariables: { user: user.toString() },
                msgType: "SUCCESS"
            }
        );

        return { result: "SUCCESS" };
    }

    private async runBlacklistList(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (
            !permissions.has(
                BotPermissionsBitField.Flags.ManageCountingBlacklist
            )
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
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "counting.noBlacklistsExist",
                    msgType: "INVALID"
                }
            );
            return { result: "SUCCESS" };
        }

        const embed = await this.client.utils.getCountingBlacklistListPage(i);
        if (blacklistCount <= 10) {
            this.client.sender.reply(i, { embeds: [embed] });
            return { result: "SUCCESS" };
        }

        const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
            CountingBlacklistListPreviousPageButtonComponent.builder,
            new ButtonBuilder(
                CountingBlacklistListSelectPageStartButtonComponent.builder.toJSON()
            ).setLabel(`1/${Math.ceil(blacklistCount / 10)}`),
            CountingBlacklistListNextPageButtonComponent.builder
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
                note: "Counting blacklist list message unavailable",
                error: new Error("Message unavailable")
            };
        }

        this.client.redis.setMessageContext("countingBlacklistList", reply.id, {
            page: 1,
            pageMenuOwnerId: i.user.id
        });

        return { result: "SUCCESS" };
    }

    private async runBlacklistView(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (
            !permissions.has(
                BotPermissionsBitField.Flags.ManageCountingBlacklist
            )
        ) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const blacklistId = i.options.getNumber("blacklist-id", true);
        const blacklist = await this.client.prisma.blacklists.findUnique({
            where: { Guild: { discordId: i.guild!.id }, id: blacklistId },
            select: {
                id: true,
                createdAt: true,
                reason: true,
                GivenByUser: {
                    select: {
                        discordId: true
                    }
                },
                ReceivedByUser: {
                    select: {
                        discordId: true
                    }
                }
            }
        });
        if (!blacklist) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "counting.invalidBlacklistId",
                    msgType: "INVALID"
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        this.client.sender.reply(
            i,
            {},
            {
                langType: "EMBED",
                langLocation: "counting.blacklistEmbed",
                langVariables: {
                    id: blacklist.id.toString(),
                    createdAt: `<t:${Math.round(
                        blacklist.createdAt.getTime() / 1000
                    )}:R>`,
                    givenByUser: `<@${blacklist.GivenByUser.discordId}>`,
                    receivedByUser: `<@${blacklist.ReceivedByUser.discordId}>`,
                    reason: blacklist.reason ?? "No reason was provided"
                }
            }
        );

        return { result: "SUCCESS" };
    }
}
