import { ChatInputCommand } from "@/structures";
import {
    ChannelType,
    ChatInputCommandInteraction,
    GuildTextBasedChannel,
    SlashCommandBuilder
} from "discord.js";
import { HandlerResult } from "@/types";
import { BotPermissionsBitField } from "@/classes";

export default class WelcomeChatInputCommand extends ChatInputCommand {
    constructor() {
        super({
            enabled: false,
            builder: new SlashCommandBuilder()
                .setName("welcome")
                .setNameLocalization("nl", "welkom")
                .setDescription("Change welcome settings")
                .setDescriptionLocalization(
                    "nl",
                    "Verander welkom instellingen"
                )
                .setDMPermission(false)
                .addSubcommand(builder =>
                    builder
                        .setName("set-enabled")
                        .setNameLocalization("nl", "zet-ingeschakeld")
                        .setDescription("Enable or disable the welcome feature")
                        .setDescriptionLocalization(
                            "nl",
                            "Zet de welkom functie aan of uit"
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
                        .setName("set-channel")
                        .setNameLocalization("nl", "zet-channel")
                        .setDescription(
                            "Set the welcome channel, use {{user}} to mention the user"
                        )
                        .setDescriptionLocalization(
                            "nl",
                            "Zet het welkoms kanaal, gebruik {{user}} om de gebruiker te pingen"
                        )
                        .addChannelOption(builder =>
                            builder
                                .setName("channel")
                                .setNameLocalization("nl", "kanaal")
                                .setDescription("The channel")
                                .setDescriptionLocalization("nl", "Het kanaal")
                                .addChannelTypes(ChannelType.GuildText)
                                .setRequired(true)
                        )
                )
                .addSubcommand(builder =>
                    builder
                        .setName("set-message")
                        .setNameLocalization("nl", "zet-bericht")
                        .setDescription("Set the welcome message")
                        .setDescriptionLocalization(
                            "nl",
                            "Zet het welkoms bericht"
                        )
                        .addStringOption(builder =>
                            builder
                                .setName("message")
                                .setNameLocalization("nl", "bericht")
                                .setDescription("The message")
                                .setDescriptionLocalization("nl", "Het bericht")
                                .setMaxLength(1000)
                                .setRequired(true)
                        )
                )
                .addSubcommand(builder =>
                    builder
                        .setName("view-settings")
                        .setNameLocalization("nl", "bekijk-settings")
                        .setDescription("View the welcome settings")
                        .setDescriptionLocalization(
                            "nl",
                            "Bekijk de welkoms settings"
                        )
                )
        });
    }

    public async run(i: ChatInputCommandInteraction): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (!permissions.has(BotPermissionsBitField.Flags.ManageWelcome)) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const key = `${
            i.options.getSubcommandGroup()
                ? `${i.options.getSubcommandGroup()}.`
                : ""
        }${i.options.getSubcommand()}`;

        if (key !== "set-enabled") {
            const settings = await this.client.cacheableData.getWelcomeSettings(
                i.guild!.id
            );
            if (!settings?.welcomeEnabled) {
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
            case "set-channel":
                return this.runSetChannel(i);
            case "set-message":
                return this.runSetMessage(i);
            case "view-settings":
                return this.runViewSettings(i);

            default:
                return {
                    result: "ERRORED",
                    note: "Welcome subcommand executor not found",
                    error: new Error("Command executor not found")
                };
        }
    }

    private async runSetEnabled(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const settings = await this.client.cacheableData.getWelcomeSettings(
            i.guild!.id
        );
        const newValue = i.options.getString("value", true) === "true";
        if (settings?.welcomeEnabled === newValue) {
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

        if (settings?.welcomeEnabled !== undefined) {
            await this.client.prisma.guildSettings.updateMany({
                where: {
                    type: "WELCOME_ENABLED",
                    Guild: { discordId: i.guild!.id }
                },
                data: { value: newValue ? "1" : "0" }
            });
        } else {
            await this.client.prisma.guildSettings.create({
                data: {
                    type: "WELCOME_ENABLED",
                    guildIdAndType: i.guild!.id + "WELCOME_ENABLED",
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
        await this.client.redis.delGuildSettings("welcome", i.guild!.id);

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

    private async runSetChannel(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const channel = i.options.getChannel(
            "channel",
            true
        ) as GuildTextBasedChannel;
        const botMember = await i.guild!.members.fetch(this.client.user!.id);
        const missingPerms = this.client.utils.checkPermissions(
            botMember,
            ["ViewChannel", "SendMessages"],
            channel
        );
        if (!missingPerms.hasAll) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langType: "EMBED",
                    langLocation: "welcome.botMissingPermsEmbed",
                    langVariables: { channel: channel.toString() }
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        await this.client.prisma.guildSettings.upsert({
            where: {
                Guild: { discordId: i.guild!.id },
                guildIdAndType: i.guild!.id + "WELCOME_CHANNEL"
            },
            update: {
                value: channel.id
            },
            create: {
                type: "WELCOME_CHANNEL",
                guildIdAndType: i.guild!.id + "WELCOME_CHANNEL",
                value: channel.id,
                Guild: {
                    connectOrCreate: {
                        where: { discordId: i.guild!.id },
                        create: { discordId: i.guild!.id }
                    }
                }
            }
        });
        this.client.redis.delGuildSettings("welcome", i.guild!.id);

        this.client.sender.reply(
            i,
            {},
            {
                langLocation: "welcome.channelSet",
                langVariables: { channel: channel.toString() },
                msgType: "SUCCESS"
            }
        );

        return { result: "SUCCESS" };
    }

    private async runSetMessage(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const message = i.options.getString("message", true);

        await this.client.prisma.guildSettings.upsert({
            where: {
                Guild: { discordId: i.guild!.id },
                guildIdAndType: i.guild!.id + "WELCOME_MESSAGE"
            },
            update: {
                value: message
            },
            create: {
                type: "WELCOME_MESSAGE",
                guildIdAndType: i.guild!.id + "WELCOME_MESSAGE",
                value: message,
                Guild: {
                    connectOrCreate: {
                        where: { discordId: i.guild!.id },
                        create: { discordId: i.guild!.id }
                    }
                }
            }
        });
        this.client.redis.delGuildSettings("welcome", i.guild!.id);

        this.client.sender.reply(
            i,
            {},
            {
                langLocation: "welcome.messageSetEmbed",
                langVariables: { message },
                langType: "EMBED"
            }
        );

        return { result: "SUCCESS" };
    }

    private async runViewSettings(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const settings = await this.client.cacheableData.getWelcomeSettings(
            i.guild!.id
        );

        this.client.sender.reply(
            i,
            {},
            {
                langLocation: "welcome.viewSettingsEmbed",
                langType: "EMBED",
                langVariables: {
                    channel: settings?.welcomeChannel
                        ? `<#${settings.welcomeChannel}>`
                        : "-",
                    message: settings?.welcomeMessage ?? "-"
                }
            }
        );

        return { result: "SUCCESS" };
    }
}
