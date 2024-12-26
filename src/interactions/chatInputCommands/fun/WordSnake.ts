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
import WordSnakeChannelConfirmButtonComponent from "@/button/fun/wordSnake/WordSnakeChannelConfirm";
import WordSnakeChannelCancelButtonComponent from "@/button/fun/wordSnake/WordSnakeChannelCancel";
import WordSnakeBlacklistListPreviousPageButtonComponent from "@/button/fun/wordSnake/WordSnakeBlacklistListPreviousPage";
import WordSnakeBlacklistListSelectPageStartButtonComponent from "@/button/fun/wordSnake/WordSnakeBlacklistListSelectPageStart";
import WordSnakeBlacklistListNextPageButtonComponent from "@/button/fun/wordSnake/WordSnakeBlacklistListNextPage";
import WordSnakeLeaderboardPreviousPageButtonComponent from "@/button/fun/wordSnake/WordSnakeLeaderboardPreviousPage";
import WordSnakeLeaderboardSelectPageStartButtonComponent from "@/button/fun/wordSnake/WordSnakeLeaderboardSelectPageStart";
import WordSnakeLeaderboardNextPageButtonComponent from "@/button/fun/wordSnake/WordSnakeLeaderboardNextPage";

export default class WordSnakeChatInputCommand extends ChatInputCommand {
    constructor() {
        super({
            builder: new SlashCommandBuilder()
                .setName("word-snake")
                .setNameLocalization("nl", "woorden-slang")
                .setDescription("Everything to do with word snakes")
                .setDescriptionLocalization(
                    "nl",
                    "Alles temaken met woord slangen"
                )
                .setDMPermission(false)
                .addSubcommand(builder =>
                    builder
                        .setName("set-enabled")
                        .setNameLocalization("nl", "zet-ingeschakeld")
                        .setDescription(
                            "Enable or disable the word snake feature"
                        )
                        .setDescriptionLocalization(
                            "nl",
                            "Zet de woord slang functie aan of uit"
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
                        .setDescription(
                            "View word snake statistics for the server"
                        )
                        .setDescriptionLocalization(
                            "nl",
                            "Bekijk statistieken voor woord slangen van de hele server"
                        )
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
                                        name: "Correct words",
                                        name_localizations: {
                                            nl: "Correcte woorden"
                                        },
                                        value: "correct"
                                    },
                                    {
                                        name: "Incorrect words",
                                        name_localizations: {
                                            nl: "Incorrecte woorden"
                                        },
                                        value: "incorrect"
                                    },
                                    {
                                        name: "Correct to incorrect ratio",
                                        name_localizations: {
                                            nl: "Correcte tot onjuiste verhouding"
                                        },
                                        value: "ratio"
                                    }
                                ])
                        )
                )
                .addSubcommandGroup(builder =>
                    builder
                        .setName("channel")
                        .setNameLocalization("nl", "kanaal")
                        .setDescription("Configure the word snake channel")
                        .setDescriptionLocalization(
                            "nl",
                            "Instellingen voor het word slangen kanaal"
                        )
                        .addSubcommand(builder =>
                            builder
                                .setName("set")
                                .setNameLocalization("nl", "instellen")
                                .setDescription("Set the word snake channel")
                                .setDescriptionLocalization(
                                    "nl",
                                    "Selecteer het woord slangen kanaal"
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
                                    "View the current word snake channel"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Bekijk het huidige woord slangen kanaal"
                                )
                        )
                        .addSubcommand(builder =>
                            builder
                                .setName("reset")
                                .setNameLocalization("nl", "resetten")
                                .setDescription(
                                    "Delete the configured channel and the current word snake"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Verwijder het ingestelde kanaal en de huidige woorden slang"
                                )
                        )
                )
                .addSubcommandGroup(builder =>
                    builder
                        .setName("blacklist")
                        .setNameLocalization("nl", "blokkades")
                        .setDescription("Manage word snake blacklists")
                        .setDescriptionLocalization(
                            "nl",
                            "Beheer woord slangen blokkades"
                        )
                        .addSubcommand(builder =>
                            builder
                                .setName("add")
                                .setNameLocalization("nl", "toevoegen")
                                .setDescription(
                                    "Blacklist a user from sending word snakes"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Blokkeer een gebruiker van woord slangen sturen"
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
                                    "Undo a blacklist for a user from sending word snakes"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Deblokkeer een gebruiker van woord slangen sturen"
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
                                    "View a list of all word snake blacklists"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Bekijk een lijst van alle woord slangen blokkades"
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
                                            "The id of the blacklist to delete, get the id using /wordsnake blacklist list"
                                        )
                                        .setDescriptionLocalization(
                                            "nl",
                                            "Het id van de blokkade om te verwijderen, verkrijg het id met /woord-slang blacklist lijst"
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
                await this.client.cacheableData.getWordSnakeSettings(
                    i.guild!.id
                );
            if (!settings?.wordSnakeEnabled) {
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
                    note: "Word snake subcommand executor not found",
                    error: new Error("Command executor not found")
                };
        }
    }

    private async runSetEnabled(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (!permissions.has(BotPermissionsBitField.Flags.ManageWordSnake)) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const settings = await this.client.cacheableData.getWordSnakeSettings(
            i.guild!.id
        );
        const newValue = i.options.getString("value", true) === "true";
        if (settings?.wordSnakeEnabled === newValue) {
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

        if (settings?.wordSnakeEnabled !== undefined) {
            await this.client.prisma.guildSettings.updateMany({
                where: {
                    type: "WORD_SNAKE_ENABLED",
                    Guild: { discordId: i.guild!.id }
                },
                data: { value: newValue ? "1" : "0" }
            });
        } else {
            await this.client.prisma.guildSettings.create({
                data: {
                    type: "WORD_SNAKE_ENABLED",
                    guildIdAndType: i.guild!.id + "WORD_SNAKE_ENABLED",
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
        await this.client.redis.delGuildSettings("wordSnake", i.guild!.id);

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

    private async runStatistics(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const userCounts = await this.client.prisma.wordSnakeStats.aggregate({
            where: { Guild: { discordId: i.guild!.id } },
            _sum: { correct: true, incorrect: true }
        });
        const usersCounted = await this.client.prisma.wordSnakeStats.count({
            where: {
                Guild: { discordId: i.guild!.id },
                correct: { gt: 0 }
            }
        });
        const usersIncorrect = await this.client.prisma.wordSnakeStats.count({
            where: {
                Guild: { discordId: i.guild!.id },
                incorrect: { gt: 0 }
            }
        });
        const wordSnakeSettings =
            await this.client.cacheableData.getWordSnakeSettings(i.guild!.id);

        this.client.sender.reply(
            i,
            {},
            {
                langType: "EMBED",
                langLocation: "wordSnake.statisticsEmbed",
                langVariables: {
                    correct: (userCounts._sum.correct ?? 0).toString(),
                    incorrect: (userCounts._sum.incorrect ?? 0).toString(),
                    highest: (
                        wordSnakeSettings?.highestWordSnake ?? 0
                    ).toString(),
                    usersCorrect: usersCounted.toString(),
                    usersIncorrect: usersIncorrect.toString()
                }
            }
        );

        return { result: "SUCCESS" };
    }

    private async runLeaderboard(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const type = i.options.getString("type", true) as
            | "correct"
            | "incorrect"
            | "ratio";
        const userCount = await this.client.prisma.wordSnakeStats.count({
            where: {
                Guild: { discordId: i.guild!.id },
                ...(type === "correct" || type === "ratio"
                    ? { correct: { gt: 0 } }
                    : { incorrect: { gt: 0 } })
            }
        });
        if (userCount === 0) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "wordSnake.noUsersOnLeaderboard",
                    msgType: "INVALID"
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const embed = await this.client.utils.getWordSnakeLeaderboardPage(
            i,
            type
        );
        if (userCount <= 10) {
            this.client.sender.reply(i, { embeds: [embed] });
            return { result: "SUCCESS" };
        }

        const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
            WordSnakeLeaderboardPreviousPageButtonComponent.builder,
            new ButtonBuilder(
                WordSnakeLeaderboardSelectPageStartButtonComponent.builder.toJSON()
            ).setLabel(`1/${Math.ceil(userCount / 10)}`),
            WordSnakeLeaderboardNextPageButtonComponent.builder
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
                note: "Word snake leaderboard message unavailable",
                error: new Error("Message unavailable")
            };
        }

        this.client.redis.setMessageContext("wordSnakeLeaderboard", reply.id, {
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
        if (!permissions.has(BotPermissionsBitField.Flags.ManageWordSnake)) {
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
                    langLocation: "wordSnake.botMissingPermsEmbed",
                    langVariables: { channel: channel.toString() }
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const settings = await this.client.cacheableData.getWordSnakeSettings(
            i.guild!.id
        );
        if (!settings?.wordSnakeChannel) {
            await this.client.prisma.guildSettings.create({
                data: {
                    type: "WORD_SNAKE_CHANNEL",
                    guildIdAndType: i.guild!.id + "WORD_SNAKE_CHANNEL",
                    value: channel.id,
                    Guild: {
                        connectOrCreate: {
                            where: { discordId: i.guild!.id },
                            create: { discordId: i.guild!.id }
                        }
                    }
                }
            });
            this.client.redis.delGuildSettings("wordSnake", i.guild!.id);

            this.client.sender.reply(
                i,
                {},
                {
                    langLocation: "wordSnake.channelSet",
                    langVariables: { channel: channel.toString() },
                    msgType: "SUCCESS"
                }
            );

            return { result: "SUCCESS" };
        }

        const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
            WordSnakeChannelConfirmButtonComponent.getTranslatedBuilder(
                i.locale,
                this.client.lang
            ),
            WordSnakeChannelCancelButtonComponent.getTranslatedBuilder(
                i.locale,
                this.client.lang
            )
        );

        const reply = await this.client.sender.reply(
            i,
            { components: [buttons], fetchReply: true },
            {
                langType: "EMBED",
                langLocation: "wordSnake.channelConfirmEmbed",
                langVariables: {
                    oldChannel: `<#${settings.wordSnakeChannel}>`,
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
                note: "Word snake channel message unavailable",
                error: new Error("Message unavailable")
            };
        }

        this.client.redis.setMessageContext("wordSnakeChannelSet", reply.id, {
            buttonOwnerId: i.user.id,
            channelId: channel.id
        });

        return { result: "SUCCESS" };
    }

    private async runChannelView(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (!permissions.has(BotPermissionsBitField.Flags.ManageWordSnake)) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const settings = await this.client.cacheableData.getWordSnakeSettings(
            i.guild!.id
        );
        if (settings?.wordSnakeChannel) {
            this.client.sender.reply(
                i,
                {},
                {
                    langLocation: "wordSnake.viewChannel",
                    langVariables: {
                        channel: `<#${settings.wordSnakeChannel}>`
                    },
                    msgType: "SUCCESS"
                }
            );
        } else {
            this.client.sender.reply(
                i,
                {},
                {
                    langLocation: "wordSnake.noChannelSet",
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
        if (!permissions.has(BotPermissionsBitField.Flags.ManageWordSnake)) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const settings = await this.client.cacheableData.getWordSnakeSettings(
            i.guild!.id
        );
        if (!settings?.wordSnakeChannel) {
            this.client.sender.reply(
                i,
                {},
                {
                    langLocation: "wordSnake.noChannelSet",
                    msgType: "INVALID"
                }
            );
            return { result: "OTHER", note: "No word snake channel is set" };
        }

        await this.client.prisma.guildSettings.deleteMany({
            where: {
                type: {
                    in: [
                        "WORD_SNAKE_CHANNEL",
                        "CURRENT_WORD",
                        "CURRENT_WORD_USER"
                    ]
                }
            }
        });
        await this.client.prisma.usedWordSnakeWords.deleteMany({
            where: {
                Guild: { discordId: i.guild!.id }
            }
        });
        this.client.redis.delGuildSettings("wordSnake", i.guild!.id);

        this.client.sender.reply(
            i,
            {},
            { langLocation: "wordSnake.channelReset", msgType: "SUCCESS" }
        );

        return { result: "SUCCESS" };
    }

    private async runBlacklistAdd(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (
            !permissions.has(
                BotPermissionsBitField.Flags.ManageWordSnakeBlacklist
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
                    langLocation: "wordSnake.cantBlacklistBot",
                    msgType: "INVALID"
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const blacklist = await this.client.cacheableData.getBlacklist(
            "wordsnake",
            i.guild!.id,
            user.id
        );
        if (blacklist) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "wordSnake.alreadyBlacklisted",
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
                { langLocation: "wordSnake.reasonTooLong", msgType: "INVALID" }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        await this.client.prisma.blacklists.create({
            data: {
                reason,
                type: "WORD_SNAKE",
                guildIdUserIdType: i.guild!.id + user.id + "WORD_SNAKE",
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
                langLocation: "wordSnake.blacklistAdded",
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
                BotPermissionsBitField.Flags.ManageWordSnakeBlacklist
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
                    langLocation: "wordSnake.cantBlacklistBot",
                    msgType: "INVALID"
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const blacklist = await this.client.cacheableData.getBlacklist(
            "wordsnake",
            i.guild!.id,
            user.id
        );
        if (!blacklist) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "wordSnake.notBlacklisted",
                    langVariables: { user: user.toString() },
                    msgType: "INVALID"
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        await this.client.prisma.blacklists.delete({
            where: { guildIdUserIdType: i.guild!.id + user.id + "WORD_SNAKE" }
        });
        this.client.redis.delBlacklist("wordsnake", i.guild!.id, user.id);

        this.client.sender.reply(
            i,
            {},
            {
                langLocation: "wordSnake.blacklistRemoved",
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
                BotPermissionsBitField.Flags.ManageWordSnakeBlacklist
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
            where: { type: "WORD_SNAKE", Guild: { discordId: i.guild!.id } }
        });
        if (blacklistCount === 0) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "wordSnake.noBlacklistsExist",
                    msgType: "INVALID"
                }
            );
            return { result: "SUCCESS" };
        }

        const embed = await this.client.utils.getWordSnakeBlacklistListPage(i);
        if (blacklistCount <= 10) {
            this.client.sender.reply(i, { embeds: [embed] });
            return { result: "SUCCESS" };
        }

        const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
            WordSnakeBlacklistListPreviousPageButtonComponent.builder,
            new ButtonBuilder(
                WordSnakeBlacklistListSelectPageStartButtonComponent.builder.toJSON()
            ).setLabel(`1/${Math.ceil(blacklistCount / 10)}`),
            WordSnakeBlacklistListNextPageButtonComponent.builder
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
                note: "Word snake blacklist list message unavailable",
                error: new Error("Message unavailable")
            };
        }

        this.client.redis.setMessageContext(
            "wordSnakeBlacklistList",
            reply.id,
            {
                page: 1,
                pageMenuOwnerId: i.user.id
            }
        );

        return { result: "SUCCESS" };
    }

    private async runBlacklistView(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (
            !permissions.has(
                BotPermissionsBitField.Flags.ManageWordSnakeBlacklist
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
                    langLocation: "wordSnake.invalidBlacklistId",
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
                langLocation: "wordSnake.blacklistEmbed",
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
