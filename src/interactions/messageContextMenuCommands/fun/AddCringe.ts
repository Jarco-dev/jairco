import { HandlerResult } from "@/types";
import { MessageContextMenuCommand } from "@/structures";
import {
    MessageContextMenuCommandInteraction,
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";
import { BotPermissionsBitField } from "@/classes";

export default class AddCringeMessageContextMenuCommand extends MessageContextMenuCommand {
    constructor() {
        super({
            builder: new ContextMenuCommandBuilder()
                .setType(ApplicationCommandType.Message)
                .setDMPermission(false)
                .setName("Add cringe")
                .setNameLocalization("nl", "Cringe toevoegen")
        });
    }

    public async run(
        i: MessageContextMenuCommandInteraction
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

        if (i.user.id === i.targetMessage.author.id) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "cringe.cantAddToSelf", msgType: "INVALID" }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const existingCringe = await this.client.prisma.cringes.findUnique({
            where: {
                Guild: { discordId: i.guild!.id },
                messageId: i.targetMessage.id
            },
            select: { GivenByUser: { select: { discordId: true } } }
        });
        if (existingCringe) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "cringe.alreadyAdded",
                    langVariables: {
                        user: `<@${existingCringe.GivenByUser.discordId}>`
                    },
                    msgType: "INVALID"
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const [cringeCount] = await this.client.prisma.$transaction([
            this.client.prisma.cringes.count({
                where: {
                    Guild: { discordId: i.guild!.id },
                    ReceivedByUser: { discordId: i.targetMessage.author.id }
                }
            }),
            this.client.prisma.cringes.create({
                data: {
                    channelId: i.targetMessage.channelId,
                    messageId: i.targetMessage.id,
                    messageContent: i.targetMessage.content,
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
                                guildIdAndDiscordId:
                                    i.guild!.id + i.targetMessage.author.id
                            },
                            create: {
                                discordId: i.targetMessage.author.id,
                                guildIdAndDiscordId:
                                    i.guild!.id + i.targetMessage.author.id,
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

        const button = new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel(
                    this.client.lang.getString(i.locale, "cringe.goToMessage")
                )
                .setURL(i.targetMessage.url)
        );
        this.client.sender.reply(
            i,
            {
                content: i.targetMessage.author.toString(),
                components: [button]
            },
            {
                langType: "EMBED",
                langLocation: "cringe.addedEmbed",
                langVariables: {
                    user: i.targetMessage.author.username,
                    cringeCount: `${cringeCount + 1}`,
                    messageContent: i.targetMessage.content
                        ? `*${i.targetMessage.content}*`
                        : ""
                }
            }
        );

        return { result: "SUCCESS" };
    }
}
