import { BotPermissionsBitField } from "@/classes";

export type BotPermissionsString = keyof typeof BotPermissionsBitField.Flags;
