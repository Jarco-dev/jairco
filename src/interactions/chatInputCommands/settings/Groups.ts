import { HandlerResult } from "@/types";
import { ChatInputCommand } from "@/structures";
import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    StringSelectMenuBuilder
} from "discord.js";
import { BotPermissionsBitField } from "@/classes";
import GroupPermissionsAddStringSelectMenuComponent from "@/stringMenu/settings/GroupPermissionsAdd";
import GroupPermissionsRemoveStringSelectMenuComponent from "@/stringMenu/settings/GroupPermissionsRemove";

export default class GroupsChatInputCommand extends ChatInputCommand {
    constructor() {
        super({
            builder: new SlashCommandBuilder()
                .setName("groups")
                .setNameLocalization("nl", "groepen")
                .setDescription("Manage the bots permission groups")
                .setDescriptionLocalization(
                    "nl",
                    "Beheer de bots rechten groepen"
                )
                .setDMPermission(false)
                .addSubcommand(builder =>
                    builder
                        .setName("create")
                        .setNameLocalization("nl", "creëren")
                        .setDescription("Create a permission group")
                        .setDescriptionLocalization(
                            "nl",
                            "Creëer een rechten groep"
                        )
                        .addStringOption(builder =>
                            builder
                                .setName("name")
                                .setNameLocalization("nl", "naam")
                                .setDescription("Group name")
                                .setDescriptionLocalization("nl", "Groep naam")
                                .setRequired(true)
                                .setMinLength(1)
                                .setMaxLength(32)
                        )
                )
                .addSubcommand(builder =>
                    builder
                        .setName("delete")
                        .setNameLocalization("nl", "verwijderen")
                        .setDescription("Delete a permission group")
                        .setDescriptionLocalization(
                            "nl",
                            "Verwijder een rechten groep"
                        )
                        .addStringOption(builder =>
                            builder
                                .setName("group")
                                .setNameLocalization("nl", "groep")
                                .setDescription("The permission group")
                                .setDescriptionLocalization("nl", "De groep")
                                .setAutocomplete(true)
                                .setRequired(true)
                        )
                )
                .addSubcommand(builder =>
                    builder
                        .setName("list")
                        .setNameLocalization("nl", "lijst")
                        .setDescription("View all the permission groups")
                        .setDescriptionLocalization(
                            "nl",
                            "Bekijk al de rechten groepen"
                        )
                )
                .addSubcommand(builder =>
                    builder
                        .setName("view")
                        .setNameLocalization("nl", "bekijk")
                        .setDescription("View a group")
                        .setDescriptionLocalization("nl", "Bekijk een groep")
                        .addStringOption(builder =>
                            builder
                                .setName("group")
                                .setNameLocalization("nl", "groep")
                                .setDescription("The permission group")
                                .setDescriptionLocalization(
                                    "nl",
                                    "De rechten groep"
                                )
                                .setAutocomplete(true)
                                .setRequired(true)
                        )
                )
                .addSubcommand(builder =>
                    builder
                        .setName("list-for")
                        .setNameLocalization("nl", "lijst-voor")
                        .setDescription(
                            "View a list of a users groups and permissions"
                        )
                        .setDescriptionLocalization(
                            "nl",
                            "Bekijk een lijst van een gebruikers groepen en rechten"
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
                .addSubcommandGroup(builder =>
                    builder
                        .setName("role")
                        .setNameLocalization("nl", "rol")
                        .setDescription("Manage the permission group roles")
                        .setDescriptionLocalization(
                            "nl",
                            "Beheer de rechten groep rollen"
                        )
                        .addSubcommand(builder =>
                            builder
                                .setName("add")
                                .setNameLocalization("nl", "toevoegen")
                                .setDescription(
                                    "Add a role to a permission group"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Voeg een rol toe aan een rechten groep"
                                )
                                .addStringOption(builder =>
                                    builder
                                        .setName("group")
                                        .setNameLocalization("nl", "groep")
                                        .setDescription("The permission group")
                                        .setDescriptionLocalization(
                                            "nl",
                                            "De rechten groep"
                                        )
                                        .setAutocomplete(true)
                                        .setRequired(true)
                                )
                                .addRoleOption(builder =>
                                    builder
                                        .setName("role")
                                        .setNameLocalization("nl", "rol")
                                        .setDescription("The role to add")
                                        .setDescriptionLocalization(
                                            "nl",
                                            "De rol om toe te voegen"
                                        )
                                        .setRequired(true)
                                )
                        )
                        .addSubcommand(builder =>
                            builder
                                .setName("remove")
                                .setNameLocalization("nl", "verwijderen")
                                .setDescription(
                                    "Remove a role from a permission group"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Verwijder een rol van een rechten groep"
                                )
                                .addStringOption(builder =>
                                    builder
                                        .setName("group")
                                        .setNameLocalization("nl", "groep")
                                        .setDescription("The permission group")
                                        .setDescriptionLocalization(
                                            "nl",
                                            "De rechten groep"
                                        )
                                        .setAutocomplete(true)
                                        .setRequired(true)
                                )
                                .addRoleOption(builder =>
                                    builder
                                        .setName("role")
                                        .setNameLocalization("nl", "rol")
                                        .setDescription("The role to add")
                                        .setDescriptionLocalization(
                                            "nl",
                                            "De rol om te verwijderen"
                                        )
                                        .setRequired(true)
                                )
                        )
                        .addSubcommand(builder =>
                            builder
                                .setName("reset")
                                .setNameLocalization("nl", "resetten")
                                .setDescription(
                                    "Remove all roles from a permission group"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Verwijder alle rollen van een rechten groep"
                                )
                                .addStringOption(builder =>
                                    builder
                                        .setName("group")
                                        .setNameLocalization("nl", "groep")
                                        .setDescription("The permission group")
                                        .setDescriptionLocalization(
                                            "nl",
                                            "De rechten groep"
                                        )
                                        .setAutocomplete(true)
                                        .setRequired(true)
                                )
                        )
                )
                .addSubcommandGroup(builder =>
                    builder
                        .setName("user")
                        .setNameLocalization("nl", "gebruiker")
                        .setDescription("Manage the permission group users")
                        .setDescriptionLocalization(
                            "nl",
                            "Beheer de rechten groep gebruikers"
                        )
                        .addSubcommand(builder =>
                            builder
                                .setName("add")
                                .setNameLocalization("nl", "toevoegen")
                                .setDescription(
                                    "Add a user to a permission group"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Voeg een gebruiker toe aan een rechten groep"
                                )
                                .addStringOption(builder =>
                                    builder
                                        .setName("group")
                                        .setNameLocalization("nl", "groep")
                                        .setDescription("The permission group")
                                        .setDescriptionLocalization(
                                            "nl",
                                            "De rechten groep"
                                        )
                                        .setAutocomplete(true)
                                        .setRequired(true)
                                )
                                .addUserOption(builder =>
                                    builder
                                        .setName("user")
                                        .setNameLocalization("nl", "gebruiker")
                                        .setDescription("The user to add")
                                        .setDescriptionLocalization(
                                            "nl",
                                            "De gebruiker om toe te voegen"
                                        )
                                        .setRequired(true)
                                )
                        )
                        .addSubcommand(builder =>
                            builder
                                .setName("remove")
                                .setNameLocalization("nl", "verwijderen")
                                .setDescription(
                                    "Remove a user from a permission group"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Verwijder een gebruiker van een rechten groep"
                                )
                                .addStringOption(builder =>
                                    builder
                                        .setName("group")
                                        .setNameLocalization("nl", "groep")
                                        .setDescription("The permission group")
                                        .setDescriptionLocalization(
                                            "nl",
                                            "De rechten groep"
                                        )
                                        .setAutocomplete(true)
                                        .setRequired(true)
                                )
                                .addUserOption(builder =>
                                    builder
                                        .setName("user")
                                        .setNameLocalization("nl", "gebruiker")
                                        .setDescription("The user to add")
                                        .setDescriptionLocalization(
                                            "nl",
                                            "De gebruiker om te verwijderen"
                                        )
                                        .setRequired(true)
                                )
                        )
                        .addSubcommand(builder =>
                            builder
                                .setName("reset")
                                .setNameLocalization("nl", "resetten")
                                .setDescription(
                                    "Remove all users from a permission group"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Verwijder alle gebruikers van een rechten groep"
                                )
                                .addStringOption(builder =>
                                    builder
                                        .setName("group")
                                        .setNameLocalization("nl", "groep")
                                        .setDescription("The permission group")
                                        .setDescriptionLocalization(
                                            "nl",
                                            "De rechten groep"
                                        )
                                        .setAutocomplete(true)
                                        .setRequired(true)
                                )
                        )
                )
                .addSubcommandGroup(builder =>
                    builder
                        .setName("permissions")
                        .setNameLocalization("nl", "rechten")
                        .setDescription("Manage a groups permissions")
                        .setDescriptionLocalization(
                            "nl",
                            "Beheer de rechten van een groep"
                        )
                        .addSubcommand(builder =>
                            builder
                                .setName("add")
                                .setNameLocalization("nl", "toevoegen")
                                .setDescription("Add permissions to a group")
                                .setDescriptionLocalization(
                                    "nl",
                                    "Voeg rechten toe aan een groep"
                                )
                                .addStringOption(builder =>
                                    builder
                                        .setName("group")
                                        .setNameLocalization("nl", "groep")
                                        .setDescription("The permission group")
                                        .setDescriptionLocalization(
                                            "nl",
                                            "De rechten groep"
                                        )
                                        .setAutocomplete(true)
                                        .setRequired(true)
                                )
                        )
                        .addSubcommand(builder =>
                            builder
                                .setName("remove")
                                .setNameLocalization("nl", "verwijderen")
                                .setDescription(
                                    "Remove permissions from a group"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Verwijder rechten van een groep"
                                )
                                .addStringOption(builder =>
                                    builder
                                        .setName("group")
                                        .setNameLocalization("nl", "groep")
                                        .setDescription("The permission group")
                                        .setDescriptionLocalization(
                                            "nl",
                                            "De rechten groep"
                                        )
                                        .setAutocomplete(true)
                                        .setRequired(true)
                                )
                        )
                        .addSubcommand(builder =>
                            builder
                                .setName("reset")
                                .setNameLocalization("nl", "resetten")
                                .setDescription(
                                    "Remove all permissions from a permission group"
                                )
                                .setDescriptionLocalization(
                                    "nl",
                                    "Verwijder alle rechten van een rechten groep"
                                )
                                .addStringOption(builder =>
                                    builder
                                        .setName("group")
                                        .setNameLocalization("nl", "groep")
                                        .setDescription("The permission group")
                                        .setDescriptionLocalization(
                                            "nl",
                                            "De rechten groep"
                                        )
                                        .setAutocomplete(true)
                                        .setRequired(true)
                                )
                        )
                )
        });
    }

    public async run(i: ChatInputCommandInteraction): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (!permissions.has(BotPermissionsBitField.Flags.ManageGroups)) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "misc.missingPermissions", msgType: "INVALID" }
            );
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const subcommandGroupKey = i.options.getSubcommandGroup()
            ? `${i.options.getSubcommandGroup()}.`
            : "";
        switch (`${subcommandGroupKey}${i.options.getSubcommand()}`) {
            case "create":
                return this.runCreate(i);
            case "delete":
                return this.runDelete(i);
            case "list":
                return this.runList(i);
            case "view":
                return this.runView(i);
            case "list-for":
                return this.runListFor(i);

            case "role.add":
                return this.runRoleAdd(i);
            case "role.remove":
                return this.runRoleRemove(i);
            case "role.reset":
                return this.runRoleReset(i);

            case "user.add":
                return this.runUserAdd(i);
            case "user.remove":
                return this.runUserRemove(i);
            case "user.reset":
                return this.runUserReset(i);

            case "permissions.add":
                return this.runPermissionsAdd(i);
            case "permissions.remove":
                return this.runPermissionsRemove(i);
            case "permissions.reset":
                return this.runPermissionsReset(i);

            default:
                return {
                    result: "ERRORED",
                    note: "Groups subcommand executor not found",
                    error: new Error("Command executor not found")
                };
        }
    }

    private async runCreate(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const name = i.options.getString("name", true);

        await this.client.prisma.groups.create({
            data: {
                name,
                Guild: {
                    connectOrCreate: {
                        where: { discordId: i.guild!.id },
                        create: { discordId: i.guild!.id }
                    }
                }
            }
        });
        this.client.sender.reply(
            i,
            {},
            {
                langType: "EMBED",
                langLocation: "groups.groupCreatedEmbed",
                langVariables: { group: name }
            }
        );

        return { result: "SUCCESS" };
    }

    private async runDelete(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const groupId = parseInt(i.options.getString("group", true));
        const group = isNaN(groupId)
            ? undefined
            : await this.client.prisma.groups.findUnique({
                  where: { Guild: { discordId: i.guild!.id }, id: groupId },
                  select: {
                      id: true,
                      name: true,
                      Roles: {
                          select: {
                              id: true,
                              Groups: {
                                  select: {
                                      id: true
                                  }
                              }
                          }
                      }
                  }
              });
        if (!group) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "groups.noGroup", msgType: "INVALID" }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const rolesToDelete = group.Roles.filter(
            r => r.Groups.length === 1
        ).map(r => r.id);
        await this.client.prisma.$transaction([
            this.client.prisma.groups.delete({
                where: { Guild: { discordId: i.guild!.id }, id: group.id }
            }),
            this.client.prisma.roles.deleteMany({
                where: {
                    Guild: { discordId: i.guild!.id },
                    id: { in: rolesToDelete }
                }
            })
        ]);

        this.client.sender.reply(
            i,
            {},
            {
                langLocation: "groups.groupDeleted",
                langVariables: { group: group.name },
                msgType: "SUCCESS"
            }
        );

        return { result: "SUCCESS" };
    }

    private async runList(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const groups = await this.client.prisma.groups.findMany({
            where: { Guild: { discordId: i.guild!.id } },
            select: { name: true }
        });
        if (groups.length === 0) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "groups.noGroupsExist", msgType: "INVALID" }
            );
            return { result: "SUCCESS" };
        }

        this.client.sender.reply(
            i,
            {},
            {
                langType: "EMBED",
                langLocation: "groups.groupListEmbed",
                langVariables: { groups: groups.map(r => r.name).join(", ") }
            }
        );

        return { result: "SUCCESS" };
    }

    private async runView(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const groupId = parseInt(i.options.getString("group", true));
        const group = isNaN(groupId)
            ? undefined
            : await this.client.prisma.groups.findUnique({
                  where: { Guild: { discordId: i.guild!.id }, id: groupId },
                  select: {
                      name: true,
                      permissions: true,
                      Roles: {
                          select: {
                              discordId: true
                          }
                      },
                      Users: {
                          select: {
                              discordId: true
                          }
                      }
                  }
              });
        if (!group) {
            this.client.sender.reply(
                i,
                {ephemeral: true},
                {langLocation: "groups.noGroup", msgType: "INVALID"}
            );
            return {result: "INVALID_ARGUMENTS"};
        }

        const toPurge = group.Roles.filter(r => !i.guild!.roles.cache.has(r.discordId));
        if (toPurge.length > 0) {
            group.Roles = group.Roles.filter(r => i.guild!.roles.cache.has(r.discordId));
            await this.client.prisma.roles.deleteMany({
                where: { discordId: { in: toPurge.map(r => r.discordId) } }
            });
        }

        const roles =
            group.Roles.length > 0
                ? group.Roles.map(u => `<@&${u.discordId}>`).join(", ")
                : this.client.lang.getString(i.locale, "groups.noRolesOnGroup");
        const users =
            group.Users.length > 0
                ? group.Users.map(u => `<@${u.discordId}>`).join(", ")
                : this.client.lang.getString(i.locale, "groups.noUsersOnGroup");
        const permissions =
            group.permissions > 0n
                ? new BotPermissionsBitField(group.permissions)
                      .toTranslatedArray(i.locale)
                      .map(p => `\`${p}\``)
                      .join(" ")
                : this.client.lang.getString(
                      i.locale,
                      "groups.noPermissionsOnGroup"
                  );

        this.client.sender.reply(
            i,
            {},
            {
                langType: "EMBED",
                langLocation: "groups.groupViewEmbed",
                langVariables: { group: group.name, roles, users, permissions }
            }
        );

        return { result: "SUCCESS" };
    }

    public async runListFor(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const user = i.options.getUser("user", true);
        const member = await i.guild!.members.fetch(user.id);
        const groups = await this.client.prisma.groups.findMany({
            where: {
                Guild: { discordId: i.guild!.id },
                OR: [
                    { Users: { some: { discordId: member.id } } },
                    {
                        Roles: {
                            some: {
                                discordId: {
                                    in: member.roles.cache.map(r => r.id)
                                }
                            }
                        }
                    }
                ]
            },
            select: {
                name: true
            }
        });

        const permissions = await this.client.utils.getMemberBotPermissions(
            member,
            false
        );
        const embed = this.client.lang.getEmbed(
            i.locale,
            "groups.viewUserEmbed",
            {
                user: member.user.username,
                groups:
                    groups.length > 0
                        ? groups.map(g => g.name).join(", ")
                        : this.client.lang.getString(
                              i.locale,
                              "groups.userHasNoGroups"
                          ),
                permissions:
                    permissions.bitfield > 0n
                        ? permissions
                              .toTranslatedArray(i.locale)
                              .map(p => `\`${p}\``)
                              .join(" ")
                        : this.client.lang.getString(
                              i.locale,
                              "groups.userHasNoPermissions"
                          )
            }
        );
        if (member.permissions.has("Administrator")) {
            embed.setDescription(
                this.client.lang.getString(
                    i.locale,
                    "groups.userIsAdminWarning"
                )
            );
        }

        this.client.sender.reply(i, { embeds: [embed] });

        return { result: "SUCCESS" };
    }

    private async runRoleAdd(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const groupId = parseInt(i.options.getString("group", true));
        const role = i.options.getRole("role", true);
        const group = isNaN(groupId)
            ? undefined
            : await this.client.prisma.groups.findUnique({
                  where: { Guild: { discordId: i.guild!.id }, id: groupId },
                  select: {
                      id: true,
                      name: true,
                      Roles: {
                          where: { discordId: role.id },
                          select: { id: true }
                      }
                  }
              });
        if (!group) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "groups.noGroup", msgType: "INVALID" }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        if (group.Roles.length === 1) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "groups.roleAlreadyAdded",
                    langVariables: { role: role.toString(), group: group.name },
                    msgType: "INVALID"
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        await this.client.prisma.groups.update({
            where: { Guild: { discordId: i.guild!.id }, id: group.id },
            data: {
                Guild: {
                    connectOrCreate: {
                        where: { discordId: i.guild!.id },
                        create: { discordId: i.guild!.id }
                    }
                },
                Roles: {
                    connectOrCreate: {
                        where: { discordId: role.id },
                        create: {
                            discordId: role.id,
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
        });

        this.client.sender.reply(
            i,
            {},
            {
                langLocation: "groups.roleAdded",
                langVariables: { role: role.toString(), group: group.name },
                msgType: "SUCCESS"
            }
        );

        return { result: "SUCCESS" };
    }

    private async runRoleRemove(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const groupId = parseInt(i.options.getString("group", true));
        const role = i.options.getRole("role", true);
        const group = isNaN(groupId)
            ? undefined
            : await this.client.prisma.groups.findUnique({
                  where: { Guild: { discordId: i.guild!.id }, id: groupId },
                  select: {
                      id: true,
                      name: true,
                      Roles: {
                          where: { discordId: role.id },
                          select: { id: true }
                      }
                  }
              });
        if (!group) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "groups.noGroup", msgType: "INVALID" }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        if (group.Roles.length === 0) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "groups.roleNotAdded",
                    langVariables: { role: role.toString(), group: group.name },
                    msgType: "INVALID"
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const dbRole = await this.client.prisma.roles.update({
            where: { Guild: { discordId: i.guild!.id }, discordId: role.id },
            data: {
                Groups: {
                    disconnect: { id: group.id }
                }
            },
            select: {
                id: true,
                _count: {
                    select: {
                        Groups: true
                    }
                }
            }
        });
        if (dbRole._count.Groups === 0) {
            await this.client.prisma.roles.delete({
                where: { Guild: { discordId: i.guild!.id }, id: dbRole.id }
            });
        }

        this.client.sender.reply(
            i,
            {},
            {
                langLocation: "groups.roleRemoved",
                langVariables: { role: role.toString(), group: group.name },
                msgType: "SUCCESS"
            }
        );

        return { result: "SUCCESS" };
    }

    private async runRoleReset(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const groupId = parseInt(i.options.getString("group", true));
        const group = isNaN(groupId)
            ? undefined
            : await this.client.prisma.groups.findUnique({
                  where: { Guild: { discordId: i.guild!.id }, id: groupId },
                  select: {
                      id: true,
                      name: true,
                      Roles: {
                          select: {
                              discordId: true,
                              _count: {
                                  select: {
                                      Groups: true
                                  }
                              }
                          }
                      }
                  }
              });
        if (!group) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "groups.noGroup", msgType: "INVALID" }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const rolesToDelete = group.Roles.filter(
            r => r._count.Groups === 1
        ).map(r => r.discordId);
        await this.client.prisma.$transaction([
            this.client.prisma.groups.update({
                where: { Guild: { discordId: i.guild!.id }, id: groupId },
                data: { Roles: { set: [] } }
            }),
            this.client.prisma.roles.deleteMany({
                where: {
                    Guild: { discordId: i.guild!.id },
                    discordId: { in: rolesToDelete }
                }
            })
        ]);

        this.client.sender.reply(
            i,
            {},
            {
                langLocation: "groups.rolesReset",
                langVariables: { group: group.name },
                msgType: "SUCCESS"
            }
        );

        return { result: "SUCCESS" };
    }

    private async runUserAdd(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const groupId = parseInt(i.options.getString("group", true));
        const user = i.options.getUser("user", true);
        const group = isNaN(groupId)
            ? undefined
            : await this.client.prisma.groups.findUnique({
                  where: { Guild: { discordId: i.guild!.id }, id: groupId },
                  select: {
                      id: true,
                      name: true,
                      Users: {
                          where: { discordId: user.id },
                          select: { id: true }
                      }
                  }
              });
        if (!group) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "groups.noGroup", msgType: "INVALID" }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        if (group.Users.length === 1) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "groups.userAlreadyAdded",
                    langVariables: { user: user.toString(), group: group.name },
                    msgType: "INVALID"
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        await this.client.prisma.groups.update({
            where: { Guild: { discordId: i.guild!.id }, id: group.id },
            data: {
                Guild: {
                    connectOrCreate: {
                        where: { discordId: i.guild!.id },
                        create: { discordId: i.guild!.id }
                    }
                },
                Users: {
                    connectOrCreate: {
                        where: {
                            discordId: user.id
                        },
                        create: {
                            discordId: user.id,
                            Guilds: {
                                connectOrCreate: {
                                    where: { discordId: i.guild!.id },
                                    create: { discordId: i.guild!.id }
                                }
                            }
                        }
                    }
                }
            }
        });

        this.client.sender.reply(
            i,
            {},
            {
                langLocation: "groups.userAdded",
                langVariables: { user: user.toString(), group: group.name },
                msgType: "SUCCESS"
            }
        );

        return { result: "SUCCESS" };
    }

    private async runUserRemove(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const groupId = parseInt(i.options.getString("group", true));
        const user = i.options.getUser("user", true);
        const group = isNaN(groupId)
            ? undefined
            : await this.client.prisma.groups.findUnique({
                  where: { Guild: { discordId: i.guild!.id }, id: groupId },
                  select: {
                      id: true,
                      name: true,
                      Users: {
                          where: { discordId: user.id },
                          select: { id: true }
                      }
                  }
              });
        if (!group) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "groups.noGroup", msgType: "INVALID" }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        if (group.Users.length === 0) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "groups.userNotAdded",
                    langVariables: { user: user.toString(), group: group.name },
                    msgType: "INVALID"
                }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        await this.client.prisma.groups.update({
            where: { Guild: { discordId: i.guild!.id }, id: group.id },
            data: {
                Users: {
                    disconnect: { discordId: user.id }
                }
            }
        });

        this.client.sender.reply(
            i,
            {},
            {
                langLocation: "groups.userRemoved",
                langVariables: { user: user.toString(), group: group.name },
                msgType: "SUCCESS"
            }
        );

        return { result: "SUCCESS" };
    }

    private async runUserReset(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const groupId = parseInt(i.options.getString("group", true));
        const group = isNaN(groupId)
            ? undefined
            : await this.client.prisma.groups.findUnique({
                  where: { Guild: { discordId: i.guild!.id }, id: groupId },
                  select: {
                      id: true,
                      name: true,
                      Users: {
                          select: {
                              discordId: true,
                              Groups: {
                                  select: {
                                      id: true
                                  }
                              }
                          }
                      }
                  }
              });
        if (!group) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "groups.noGroup", msgType: "INVALID" }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        await this.client.prisma.groups.update({
            where: { Guild: { discordId: i.guild!.id }, id: groupId },
            data: { Users: { set: [] } }
        });

        this.client.sender.reply(
            i,
            {},
            {
                langLocation: "groups.usersReset",
                langVariables: { group: group.name },
                msgType: "SUCCESS"
            }
        );

        return { result: "SUCCESS" };
    }

    private async runPermissionsAdd(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const groupId = parseInt(i.options.getString("group", true));
        const group = isNaN(groupId)
            ? undefined
            : await this.client.prisma.groups.findUnique({
                  where: { Guild: { discordId: i.guild!.id }, id: groupId },
                  select: {
                      id: true,
                      name: true,
                      permissions: true
                  }
              });
        if (!group) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "groups.noGroup", msgType: "INVALID" }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const permissions = new BotPermissionsBitField(
            group.permissions
        ).missing(BotPermissionsBitField.All, false);
        if (permissions.length === 0) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "groups.hasAllPermissions",
                    langVariables: { group: group.name },
                    msgType: "INVALID"
                }
            );
            return { result: "SUCCESS" };
        }

        const components = [];
        do {
            const customId: string =
                `${GroupPermissionsAddStringSelectMenuComponent.builder.data.custom_id}` +
                (components.length + 1);
            const options = permissions.splice(0, 25).map(permission => ({
                label: this.client.lang.getString(
                    i.locale,
                    `permissions.${permission}`
                ),
                value: permission
            }));

            components.push(
                new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
                    new StringSelectMenuBuilder(
                        GroupPermissionsAddStringSelectMenuComponent.builder.data
                    )
                        .setCustomId(customId)
                        .setOptions(options)
                        .setMaxValues(options.length)
                )
            );
        } while (permissions.length > 0);

        const reply = await this.client.sender.reply(
            i,
            { components: components, fetchReply: true },
            {
                langType: "EMBED",
                langLocation: "groups.addPermissionsEmbed",
                langVariables: { group: group.name }
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
                note: "Groups permission add message unavailable",
                error: new Error("Message unavailable")
            };
        }

        this.client.redis.setMessageContext("groupPermissions", reply.id, {
            groupId: group.id,
            menuOwnerId: i.user.id
        });

        return { result: "SUCCESS" };
    }

    private async runPermissionsRemove(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const groupId = parseInt(i.options.getString("group", true));
        const group = isNaN(groupId)
            ? undefined
            : await this.client.prisma.groups.findUnique({
                  where: { Guild: { discordId: i.guild!.id }, id: groupId },
                  select: {
                      id: true,
                      name: true,
                      permissions: true
                  }
              });
        if (!group) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "groups.noGroup", msgType: "INVALID" }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        const permissions = new BotPermissionsBitField(
            group.permissions
        ).toArray();
        if (permissions.length === 0) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                {
                    langLocation: "groups.hasNoPermissions",
                    langVariables: { group: group.name },
                    msgType: "INVALID"
                }
            );
            return { result: "SUCCESS" };
        }

        const components = [];
        do {
            const customId: string =
                `${GroupPermissionsRemoveStringSelectMenuComponent.builder.data.custom_id}` +
                (components.length + 1);
            const options = permissions.splice(0, 25).map(permission => ({
                label: this.client.lang.getString(
                    i.locale,
                    `permissions.${permission}`
                ),
                value: permission
            }));

            components.push(
                new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
                    new StringSelectMenuBuilder(
                        GroupPermissionsRemoveStringSelectMenuComponent.builder.data
                    )
                        .setCustomId(customId)
                        .setOptions(options)
                        .setMaxValues(options.length)
                )
            );
        } while (permissions.length > 0);

        const reply = await this.client.sender.reply(
            i,
            { components: components, fetchReply: true },
            {
                langType: "EMBED",
                langLocation: "groups.removePermissionsEmbed",
                langVariables: { group: group.name }
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
                note: "Groups permission remove message unavailable",
                error: new Error("Message unavailable")
            };
        }

        this.client.redis.setMessageContext("groupPermissions", reply.id, {
            groupId: group.id,
            menuOwnerId: i.user.id
        });

        return { result: "SUCCESS" };
    }

    private async runPermissionsReset(
        i: ChatInputCommandInteraction
    ): Promise<HandlerResult> {
        const groupId = parseInt(i.options.getString("group", true));
        const group = isNaN(groupId)
            ? undefined
            : await this.client.prisma.groups.findUnique({
                  where: { Guild: { discordId: i.guild!.id }, id: groupId },
                  select: { id: true, name: true }
              });
        if (!group) {
            this.client.sender.reply(
                i,
                { ephemeral: true },
                { langLocation: "groups.noGroup", msgType: "INVALID" }
            );
            return { result: "INVALID_ARGUMENTS" };
        }

        await this.client.prisma.groups.update({
            where: { Guild: { discordId: i.guild!.id }, id: group.id },
            data: { permissions: 0n }
        });

        this.client.sender.reply(
            i,
            {},
            {
                langLocation: "groups.permissionsReset",
                langVariables: { group: group.name },
                msgType: "INVALID"
            }
        );

        return { result: "SUCCESS" };
    }
}
