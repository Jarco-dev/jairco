import { HandlerResult } from "@/types";
import { Autocomplete } from "@/structures";
import { AutocompleteInteraction } from "discord.js";
import { BotPermissionsBitField } from "@/classes";

export default class GroupsAutocomplete extends Autocomplete {
    constructor() {
        super({
            commandName: "groups"
        });
    }

    public async run(i: AutocompleteInteraction): Promise<HandlerResult> {
        const permissions = await this.client.utils.getMemberBotPermissions(i);
        if (!permissions.has(BotPermissionsBitField.Flags.ManageGroups)) {
            i.respond([]);
            return { result: "USER_MISSING_PERMISSIONS" };
        }

        const subcommandGroupKey = i.options.getSubcommandGroup()
            ? `${i.options.getSubcommandGroup()}.`
            : "";
        const option = i.options.getFocused(true);
        switch (
            `${subcommandGroupKey}${i.options.getSubcommand(true)}.${
                option.name
            }`
        ) {
            case "delete.group":
            case "view.group":
            case "role.add.group":
            case "role.remove.group":
            case "role.reset.group":
            case "user.add.group":
            case "user.remove.group":
            case "user.reset.group":
            case "permissions.add.group":
            case "permissions.remove.group":
            case "permissions.reset.group": {
                const groups = await this.client.prisma.groups.findMany({
                    where: {
                        Guild: { discordId: i.guild!.id },
                        name: { contains: option.value }
                    },
                    select: { id: true, name: true }
                });

                i.respond(
                    groups.map(r => ({
                        name: r.name,
                        value: r.id.toString()
                    }))
                );
                return { result: "SUCCESS" };
            }

            default:
                return {
                    result: "ERRORED",
                    note: "Subcommand autocomplete executor not found",
                    error: new Error("missing executor")
                };
        }
    }
}
