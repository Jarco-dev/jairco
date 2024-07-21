import { HandlerResult } from "@/types";
import { ChatInputCommand } from "@/structures";
import {
    ActionRowBuilder,
    ButtonBuilder, ButtonStyle,
    ChatInputCommandInteraction,
    PermissionsBitField,
    SlashCommandBuilder
} from "discord.js";

export default class InviteChatInputCommand extends ChatInputCommand {
    constructor() {
        super({
            builder: new SlashCommandBuilder()
                .setName("invite")
                .setNameLocalization("nl", "uitnodiging")
                .setDescription("Get a link to invite the bot")
                .setDescriptionLocalization("nl", "Verzoek een link voor het uitnodigen van de bot")
                .setDMPermission(true)
        });
    }

    public run(
        i: ChatInputCommandInteraction
    ): HandlerResult | Promise<HandlerResult> {
        const permissions = new PermissionsBitField().add(this.client.config.NEEDED_BOT_PERMISSIONS);

        const button = new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel(this.client.lang.getString(i.locale, "invite.invite"))
                .setURL(this.client.lang.getCommon("bot.invite", { botUserId: this.client.user!.id, permissions: permissions.bitfield.toString() }))
        );
        this.client.sender.reply(i, { components: [button]}, {
            langLocation: "invite.pressToInvite",
            msgType: "SUCCESS"
        });

        // Success
        return { result: "SUCCESS" };
    }
}
