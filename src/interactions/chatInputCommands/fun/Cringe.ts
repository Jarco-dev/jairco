import { HandlerResult } from "@/types";
import { ChatInputCommand } from "@/structures";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ChatInputCommandInteraction,
    SlashCommandBuilder
} from "discord.js";
import { BotPermissionsBitField } from "@/classes";
import CringeViewUserNextPageButtonComponent from "@/button/fun/CringeViewUserNextPage";
import CringeListPreviousPageButtonComponent from "@/button/fun/CringeViewUserPreviousPage";
import CringeViewUserSelectPageStartButtonComponent from "@/button/fun/CringeViewUserSelectPageStart";
import CringeDeleteConfirmButtonComponent from "@/button/fun/CringeDeleteConfirm";
import CringeDeleteCancelButtonComponent from "@/button/fun/CringeDeleteCancel";
import CringeResetConfirmButtonComponent from "@/button/fun/CringeResetConfirm";
import CringeResetCancelButtonComponent from "@/button/fun/CringeResetCancel";
import CringeLeaderboardPreviousPageButtonComponent from "@/button/fun/CringeLeaderboardPreviousPage";
import CringeLeaderboardSelectPageStartButtonComponent from "@/button/fun/CringeLeaderboardSelectPageStart";
import CringeLeaderboardNextPageButtonComponent from "@/button/fun/CringeLeaderboardNextPage";

export default class CringeChatInputCommand extends ChatInputCommand {
    constructor() {
        super({
            builder: new SlashCommandBuilder()
                .setName("cringe")
                .setNameLocalization("nl", "cringe")
                .setDescription("Everything to do with cringe")
                .setDescriptionLocalization(
                    "nl",
                    "Alles wat temaken heeft met cringe"
                )
                .setDMPermission(false)
                .addSubcommand(builder =>
                    builder
                        .setName("add")
                        .setNameLocalization("nl", "toevoegen")
                        .setDescription("Add a cringe to someone")
                        .setDescriptionLocalization(
                            "nl",
                            "Voeg cringe toe aan iemand"
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
                        .setName("delete")
                        .setNameLocalization("nl", "verwijderen")
                        .setDescription("Delete cringe from someone")
                        .setDescriptionLocalization(
                            "nl",
                            "Verwijder cringe van iemand"
                        )
                        .addNumberOption(builder =>
                            builder
                                .setName("cringe-id")
                                .setNameLocalization("nl", "cringe-id")
                                .setDescription(
                                    "The id of the cringe to delete, get the id using /cringe view-user"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Het id van het cringe om te verwijderen, verkrijg het id met /cringe view-user"
                                )
                                .setRequired(true)
                        )
                )
                .addSubcommand(builder =>
                    builder
                        .setName("reset")
                        .setNameLocalization("nl", "resetten")
                        .setDescription(
                            "Delete all of cringe that someone has given"
                        )
                        .setDescriptionLocalization(
                            "nl",
                            "Verwijder alle cringe die iemand heeft gegeven"
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
                                .setName("type")
                                .setNameLocalization("nl", "type")
                                .setDescription(
                                    "Select weather to reset given or received cringe"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Selecteer of je gegeven of ontvangen cringe resetten wil"
                                )
                                .setRequired(true)
                                .addChoices([
                                    {
                                        name: "Received",
                                        name_localizations: { nl: "Ontvangen" },
                                        value: "received"
                                    },
                                    {
                                        name: "Given",
                                        name_localizations: { nl: "Gegeven" },
                                        value: "given"
                                    }
                                ])
                        )
                )
                .addSubcommand(builder =>
                    builder
                        .setName("statistics")
                        .setNameLocalization("nl", "statistieken")
                        .setDescription("View statistics for the whole server")
                        .setDescriptionLocalization(
                            "nl",
                            "Bekijk statistieken voor de hele server"
                        )
                )
                .addSubcommand(builder =>
                    builder
                        .setName("view-user")
                        .setNameLocalization("nl", "bekijk-gebruiker")
                        .setDescription("View someones cringes")
                        .setDescriptionLocalization(
                            "nl",
                            "Bekijk iemands cringes"
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
                                        name: "Received",
                                        name_localizations: { nl: "ontvangen" },
                                        value: "received"
                                    },
                                    {
                                        name: "Given",
                                        name_localizations: { nl: "Gegeven" },
                                        value: "given"
                                    }
                                ])
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
                                        name: "Received",
                                        name_localizations: { nl: "ontvangen" },
                                        value: "received"
                                    },
                                    {
                                        name: "Given",
                                        name_localizations: { nl: "Gegeven" },
                                        value: "given"
                                    }
                                ])
                        )
                )
        });
    }

    public run(
        i: ChatInputCommandInteraction
    ): HandlerResult | Promise<HandlerResult> {
        const subcommandGroupKey = i.options.getSubcommandGroup()
            ? `${i.options.getSubcommandGroup()}.`
            : "";
        switch (`${subcommandGroupKey}${i.options.getSubcommand()}`) {
            case "add":
                return this.runCringeAdd(i);
            case "delete":
                return this.runCringeDelete(i);
            case "reset":
                return this.runCringeReset(i);
            case "statistics":
                return this.runStatistics(i);
            case "view-user":
                return this.runViewUser(i);
            case "leaderboard":
                return this.runLeaderboard(i);

            default:
                return {
                    result: "ERRORED",
                    note: "Groups subcommand executor not found",
                    error: new Error("Command executor not found")
                };
        }
    }

    private async runCringeAdd(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (!permissions.has(BotPermissionsBitField.Flags.AddCringe)) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const user = i.options.getUser("user", true);
        if (i.user.id === user.id) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "cringe.cantAddToSelf", msgType: "INVALID" }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const [cringeCount] = await this.client.prisma.$transaction([
            this.client.prisma.cringes.count({
                where: {
                    Guild: { discordId: i.guild!.id },
                    ReceivedByUser: { discordId: user.id }
                }
            }),
            this.client.prisma.cringes.create({
                data: {
                    Guild: {
                        connectOrCreate: {
                            where: { discordId: i.guild!.id },
                            create: { discordId: i.guild!.id }
                        }
                    },
                    ReceivedByUser: {
                        connectOrCreate: {
                            where: {
                                Guild: { discordId: i.guild!.id },
                                guildIdAndDiscordId: i.guild!.id + user.id
                            },
                            create: {
                                discordId: user.id,
                                guildIdAndDiscordId: i.guild!.id + user.id,
                                Guild: {
                                    connectOrCreate: {
                                        where: { discordId: i.guild!.id },
                                        create: { discordId: i.guild!.id }
                                    }
                                }
                            }
                        }
                    },
                    GivenByUser: {
                        connectOrCreate: {
                            where: {
                                Guild: { discordId: i.guild!.id },
                                guildIdAndDiscordId: i.guild!.id + i.user.id
                            },
                            create: {
                                discordId: i.user.id,
                                guildIdAndDiscordId: i.guild!.id + i.user.id,
                                Guild: {
                                    connectOrCreate: {
                                        where: { discordId: i.guild!.id },
                                        create: { discordId: i.guild!.id }
                                    }
                                }
                            }
                        }
                    }
                }
            })
        ]);

        this.client.sender.reply(
            i,
            { content: user.toString() },
            {
                langType: "EMBED",
                langLocation: "cringe.addedEmbed",
                langVariables: {
                    user: user.username,
                    cringeCount: `${cringeCount + 1}`,
                    messageContent: ""
                }
            }
        );

        return { result: "SUCCESS" };
    }

    private async runCringeDelete(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (!permissions.has(BotPermissionsBitField.Flags.ManageCringe)) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const cringeId = i.options.getNumber("cringe-id", true);
        const cringe = await this.client.prisma.cringes.findUnique({
            where: { Guild: { discordId: i.guild!.id }, id: cringeId },
            select: {
                id: true,
                createdAt: true,
                messageContent: true,
                messageId: true,
                channelId: true,
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
        if (!cringe) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "cringe.invalidCringeId", msgType: "INVALID" }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
            CringeDeleteConfirmButtonComponent.getTranslatedBuilder(
                i.locale,
                this.client.lang
            ),
            CringeDeleteCancelButtonComponent.getTranslatedBuilder(
                i.locale,
                this.client.lang
            )
        );

        const reply = await this.client.sender.reply(
            i,
            { components: [buttons], fetchReply: true },
            {
                langType: "EMBED",
                langLocation: "cringe.deleteEmbed",
                langVariables: {
                    id: cringe.id.toString(),
                    createdAt: `<t:${Math.ceil(
                        cringe.createdAt.getTime() / 1000
                    ).toString()}:R>`,
                    givenByUser: `<@${cringe.GivenByUser.discordId}>`,
                    receivedByUser: `<@${cringe.ReceivedByUser.discordId}>`,
                    messageContent: cringe.messageContent
                        ? cringe.messageContent.length > 50
                            ? `${cringe.messageContent.substring(0, 50)}...`
                            : cringe.messageContent
                        : "Unavailable",
                    messageLink: cringe.messageId
                        ? `[Go to message](https://discord.com/channels/${i.guildId}/${cringe.channelId}/${cringe.messageId})`
                        : "Unavailable"
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
                note: "Cringe delete message unavailable",
                error: new Error("Message unavailable")
            };
        }

        this.client.redis.setMessageContext("cringeDelete", reply.id, {
            cringeId: cringe.id,
            buttonOwnerId: i.user.id
        });

        return { result: "SUCCESS" };
    }

    private async runCringeReset(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (!permissions.has(BotPermissionsBitField.Flags.ManageCringe)) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const type = (await i.options.getString("type", true)) as
            | "given"
            | "received";
        const user = await i.options.getUser("user", true);

        let cringeCount: number;
        if (type === "received") {
            cringeCount = await this.client.prisma.cringes.count({
                where: {
                    Guild: { discordId: i.guild!.id },
                    ReceivedByUser: { discordId: user.id }
                }
            });
        } else {
            cringeCount = await this.client.prisma.cringes.count({
                where: {
                    Guild: { discordId: i.guild!.id },
                    GivenByUser: { discordId: user.id }
                }
            });
        }
        if (cringeCount === 0) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation:
                        type === "received"
                            ? "cringe.userHasNoCringe"
                            : "cringe.userGaveNoCringe",
                    msgType: "INVALID"
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
            CringeResetConfirmButtonComponent.getTranslatedBuilder(
                i.locale,
                this.client.lang
            ),
            CringeResetCancelButtonComponent.getTranslatedBuilder(
                i.locale,
                this.client.lang
            )
        );
        const reply = await this.client.sender.reply(
            i,
            { components: [buttons], fetchReply: true },
            {
                langType: "EMBED",
                langLocation:
                    type === "received"
                        ? "cringe.resetReceivedEmbed"
                        : "cringe.resetGivenEmbed",
                langVariables: {
                    user: user.toString(),
                    cringeCount: cringeCount.toString()
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
                note: "Cringe reset message unavailable",
                error: new Error("Message unavailable")
            };
        }

        this.client.redis.setMessageContext("cringeReset", reply.id, {
            type,
            userId: user.id,
            buttonOwnerId: i.user.id
        });

        return { result: "SUCCESS" };
    }

    private async runStatistics(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const cringeGiven = await this.client.prisma.cringes.count({
            where: { Guild: { discordId: i.guild!.id } }
        });
        const cringeWithMessage = await this.client.prisma.cringes.count({
            where: {
                Guild: { discordId: i.guild!.id },
                messageContent: { not: null }
            }
        });
        const cringeWithoutMessage = await this.client.prisma.cringes.count({
            where: { Guild: { discordId: i.guild!.id }, messageContent: null }
        });
        const userCounts: [{ received: bigint; given: bigint }] = await this
            .client.prisma
            .$queryRaw`SELECT COUNT(DISTINCT Cringes.receivedByUserId) as received, COUNT(DISTINCT Cringes.givenByUserId) as given FROM Cringes JOIN Guilds ON Cringes.guildId=Guilds.id WHERE Guilds.discordId=${
            i.guild!.id
        }`;

        this.client.sender.reply(
            i,
            {},
            {
                langType: "EMBED",
                langLocation: "cringe.statisticsEmbed",
                langVariables: {
                    cringeGiven: cringeGiven.toString(),
                    cringeWithMessage: cringeWithMessage.toString(),
                    cringeWithoutMessage: cringeWithoutMessage.toString(),
                    usersGiven: Number(userCounts[0].given).toString(),
                    usersReceived: Number(userCounts[0].received).toString()
                }
            }
        );

        return { result: "SUCCESS" };
    }

    private async runViewUser(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const type = i.options.getString("type", true) as "given" | "received";
        const user = i.options.getUser("user", true);
        const cringeCount =
            type === "received"
                ? await this.client.prisma.cringes.count({
                      where: {
                          Guild: { discordId: i.guild!.id },
                          ReceivedByUser: { discordId: user.id }
                      }
                  })
                : await this.client.prisma.cringes.count({
                      where: {
                          Guild: { discordId: i.guild!.id },
                          GivenByUser: { discordId: user.id }
                      }
                  });
        if (cringeCount === 0) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation:
                        type === "received"
                            ? "cringe.userHasNoCringe"
                            : "cringe.userGaveNoCringe",
                    msgType: "INVALID"
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const embed = await this.client.utils.getViewUserCringesPage(
            i,
            user,
            type,
            cringeCount
        );
        const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
            CringeListPreviousPageButtonComponent.builder,
            new ButtonBuilder(
                CringeViewUserSelectPageStartButtonComponent.builder.data
            ).setLabel(`1/${Math.ceil(cringeCount / 10)}`),
            CringeViewUserNextPageButtonComponent.builder
        );

        const reply = await this.client.sender.reply(i, {
            embeds: [embed],
            components: cringeCount > 10 ? [buttons] : [],
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
                note: "Cringe view-user message unavailable",
                error: new Error("Message unavailable")
            };
        }

        this.client.redis.setMessageContext("cringeViewUser", reply.id, {
            pageMenuOwnerId: i.user.id,
            userId: user.id,
            type,
            page: 1
        });

        return { result: "SUCCESS" };
    }

    public async runLeaderboard(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const type = i.options.getString("type", true) as "received" | "given";
        const dbRes: [{ received: bigint; given: bigint }] = await this.client
            .prisma
            .$queryRaw`SELECT COUNT(DISTINCT Cringes.receivedByUserId) as received, COUNT(DISTINCT Cringes.givenByUserId) as given FROM Cringes JOIN Guilds ON Cringes.guildId=Guilds.id WHERE Guilds.discordId=${
            i.guild!.id
        }`;
        const userCount =
            type === "received"
                ? Number(dbRes[0].received)
                : Number(dbRes[0].given);
        if (userCount === 0) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "cringe.noCringeExists", msgType: "INVALID" }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const embed = await this.client.utils.getCringeLeaderboardPage(i, type);
        const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents(
            CringeLeaderboardPreviousPageButtonComponent.builder,
            new ButtonBuilder(
                CringeLeaderboardSelectPageStartButtonComponent.builder.toJSON()
            ).setLabel(`1/${Math.ceil(userCount / 10)}`),
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
                {},
                { msgType: "ERROR", langLocation: "misc.somethingWentWrong" }
            );
            return {
                result: "ERRORED",
                note: "Cringe leaderboard message unavailable",
                error: new Error("Message unavailable")
            };
        }

        this.client.redis.setMessageContext("cringeLeaderboard", reply.id, {
            pageMenuOwnerId: i.user.id,
            type,
            page: 1
        });

        return { result: "SUCCESS" };
    }
}
