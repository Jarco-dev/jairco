import { BotPermissionsString, HandlerResult } from "@/types";
import { StringSelectMenuComponent } from "@/structures";
import {
    StringSelectMenuInteraction,
    StringSelectMenuBuilder
} from "discord.js";
import { BotPermissionsBitField } from "@/classes";

export default class GroupPermissionsAddStringSelectMenuComponent extends StringSelectMenuComponent {
    public static readonly builder = new StringSelectMenuBuilder()
        .setCustomId("groupPermissionsAdd")
        .setMinValues(1)
        .setMaxValues(25);

    constructor() {
        super({
            builder: GroupPermissionsAddStringSelectMenuComponent.builder,
            matchRegex: /groupPermissionsAdd[12345]/
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
                { ephemeral: true, components: [] },
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
            where: { id: context.groupId },
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
        const addedPermissions = new BotPermissionsBitField(
            i.values as BotPermissionsString[]
        );
        await this.client.prisma.groups.update({
            where: { id: context.groupId },
            data: {
                permissions: groupPermissions.add(addedPermissions).bitfield
            }
        });
        this.client.redis.delMessageContext("groupPermissions", i.message.id);

        this.client.sender.reply(
            i,
            { components: [] },
            {
                langType: "EMBED",
                langLocation: "groups.permissionsAddedEmbed",
                langVariables: {
                    group: group.name,
                    permissions: addedPermissions
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
