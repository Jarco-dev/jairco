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
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (!permissions.has(BotPermissionsBitField.Flags.ManageGroups)) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const groupId = await this.client.redis.getGroupModifyMessage(
            i.message.id
        );
        if (!groupId) {
            this.client.sender.reply(
                i,
                { ephemeral: true, components: [] },
                { langLocation: "misc.actionExpired", msgType: "INVALID" }
            );
            return { result: "ACTION_EXPIRED" };
        }

        const group = await this.client.prisma.groups.findUnique({
            where: { id: groupId },
            select: { id: true, name: true, permissions: true }
        });
        if (!group) {
            this.client.redis.delGroupModifyMessage(i.message.id);
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
            where: { id: groupId },
            data: {
                permissions:
                    groupPermissions.remove(removedPermissions).bitfield
            }
        });
        this.client.redis.delGroupModifyMessage(i.message.id);

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
