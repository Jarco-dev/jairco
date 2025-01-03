import { HandlerResult } from "@/types";
import { ChatInputCommand } from "@/structures";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BotPermissionsBitField } from "@/classes";

export default class ChannelChatInputCommand extends ChatInputCommand {
    constructor() {
        super({
            builder: new SlashCommandBuilder()
                .setName("channel")
                .setNameLocalization("nl", "kanaal")
                .setDescription("Change channel settings")
                .setDescriptionLocalization(
                    "nl",
                    "Verander kanaal instellingen"
                )
                .setDMPermission(false)
                .addSubcommand(builder =>
                    builder
                        .setName("toggle")
                        .setNameLocalization("nl", "aan-uitzetten")
                        .setDescription("Toggle a setting")
                        .setDescriptionLocalization(
                            "nl",
                            "Schakel een setting in of uit"
                        )
                        .addStringOption(builder =>
                            builder
                                .setName("setting")
                                .setNameLocalization("nl", "setting")
                                .setDescription("The setting")
                                .setDescriptionLocalization("nl", "De setting")
                                .setRequired(true)
                                .addChoices({
                                    name: "Sticker filter",
                                    name_localizations: {
                                        nl: "Stikker filter"
                                    },
                                    value: "stickerFilter"
                                })
                        )
                )
        });
    }

    public async run(i: ChatInputCommandInteraction): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (
            !permissions.has(BotPermissionsBitField.Flags.ManageChannelSettings)
        ) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const setting = i.options.getString("setting", true) as "stickerFilter";
        const settings = await this.client.cacheableData.getChannelSettings(
            i.channel!.id
        );

        const newSettings = await this.client.prisma.channels.upsert({
            where: { discordId: i.channel!.id },
            update: {
                [setting]: settings ? !settings[setting] : true
            },
            create: {
                discordId: i.channel!.id,
                [setting]: true,
                Guild: {
                    connectOrCreate: {
                        where: { discordId: i.guild!.id },
                        create: { discordId: i.guild!.id }
                    }
                }
            },
            select: { stickerFilter: true }
        });
        this.client.redis.delChannelSettings(i.channel!.id);

        const langLocation = `channel.stickerFilter${
            newSettings.stickerFilter ? "Enabled" : "Disabled"
        }`;
        this.client.sender.reply(
            i,
            {},
            {
                langLocation,
                langVariables: { channel: i.channel!.toString() },
                msgType: "SUCCESS"
            }
        );

        // Success
        return { result: "SUCCESS" };
    }
}
