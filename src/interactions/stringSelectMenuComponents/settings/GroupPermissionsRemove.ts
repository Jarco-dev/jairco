import { BotPermissionsString, HandlerResult } from "@/types";
import { StringSelectMenuComponent } from "@/structures";
import {
    StringSelectMenuInteraction,
    StringSelectMenuBuilder
} from "discord.js";
import { BotPermissionsBitField } from "@/classes";

export default class GroupPermissionsRemoveStringSelectMenuComponent extends StringSelectMenuComponent {
    public static readonly builder = new StringSelectMenuBuilder()
        .setCustomId("groupPermissionsRemove")
        .setMinValues(1)
        .setMaxValues(25);

    constructor() {
        super({
            builder: GroupPermissionsRemoveStringSelectMenuComponent.builder,
            matchRegex: /groupPermissionsRemove[12345]/
        });
    }

    public async run(i: StringSelectMenuInteraction): Promise<HandlerResult> {
        const context = await this.client.redis.getMessageContext(
            "groupPermissions",
            i.message.id
        );
        if (!context) {
            this.client.sender.reply(
                i,
                { components: [] },
                {
                    langLocation: "misc.actionExpired",
                    msgType: "INVALID",
                    method: "UPDATE"
                }
            );
            return { result: "ACTION_EXPIRED" };
        }

        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (
            !permissions.has(BotPermissionsBitField.Flags.ManageGroups) ||
            i.user.id !== context.menuOwnerId
        ) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "misc.missingPermissions",
                    msgType: "INVALID",
                    method: "UPDATE"
                }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const group = await this.client.prisma.groups.findUnique({
            where: { Guilds: { discordId: i.guild!.id }, id: context.groupId },
            select: { id: true, name: true, permissions: true }
        });
        if (!group) {
            this.client.redis.delMessageContext(
                "groupPermissions",
                i.message.id
            );
            this.client.sender.reply(
                i,
                { ephemeral: true, components: [] },
                {
                    langLocation: "group.noGroup",
                    msgType: "INVALID",
                    method: "UPDATE"
                }
            );
            return {
                result: "ERRORED",
                note: "Group from redis not found",
                error: new Error("Group not found")
            };
        }

        const groupPermissions = new BotPermissionsBitField(group.permissions);
        const removedPermissions = new BotPermissionsBitField(
            i.values as BotPermissionsString[]
        );
        await this.client.prisma.groups.update({
            where: { Guilds: { discordId: i.guild!.id }, id: context.groupId },
            data: {
                permissions:
                    groupPermissions.remove(removedPermissions).bitfield
            }
        });
        this.client.redis.delMessageContext("groupPermissions", i.message.id);

        this.client.sender.reply(
            i,
            { components: [] },
            {
                langType: "EMBED",
                langLocation: "groups.permissionsRemovedEmbed",
                langVariables: {
                    group: group.name,
                    permissions: removedPermissions
                        .toTranslatedArray(i.locale)
                        .map(p => `\`${p}\``)
                        .join(" ")
                },
                method: "UPDATE"
            }
        );

        // Success
        return { result: "SUCCESS" };
    }
}
