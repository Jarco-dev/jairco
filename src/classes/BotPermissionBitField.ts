import { BitField, BitFieldResolvable, LocaleString } from "discord.js";
import { BotPermissionsString } from "@/types";
import Client from "../index";

export class BotPermissionsBitField extends BitField<
    BotPermissionsString,
    bigint
> {
    private client = Client;
    public static Flags = {
        Administrator: 1n << 0n,
        ManageGroups: 1n << 1n
    } as const;
    static All = Object.values(this.Flags).reduce((all, p) => all | p, 0n);
    static DefaultBit = BigInt(0);

    /**
     * Gets all given bits that are missing from the bitfield
     */
    public missing(
        bits: BitFieldResolvable<BotPermissionsString, bigint>,
        checkAdmin = true
    ): BotPermissionsString[] {
        return checkAdmin &&
            this.has(BotPermissionsBitField.Flags.Administrator)
            ? []
            : super.missing(bits);
    }

    /**
     * Checks whether the bitfield has a permission, or any of multiple permissions
     */
    public any(
        permission: BitFieldResolvable<BotPermissionsString, bigint>,
        checkAdmin = true
    ): boolean {
        return (
            (checkAdmin &&
                super.has(BotPermissionsBitField.Flags.Administrator)) ||
            super.any(permission)
        );
    }

    /**
     * Checks whether the bitfield has a permission, or multiple permissions
     */
    public has(
        permission: BitFieldResolvable<BotPermissionsString, bigint>,
        checkAdmin = true
    ): boolean {
        return (
            (checkAdmin &&
                super.has(BotPermissionsBitField.Flags.Administrator)) ||
            super.has(permission)
        );
    }

    /**
     * Gets an array of bitfield names based on the permissions available
     */
    public toArray(): BotPermissionsString[] {
        return super.toArray(false);
    }

    /**
     * Gets an array of translated bitfield names based on the permissions available
     */
    public toTranslatedArray(locale: LocaleString = "en-US"): string[] {
        return super
            .toArray(false)
            .map(p => this.client.lang.getString(locale, `permissions.${p}`));
    }
}
