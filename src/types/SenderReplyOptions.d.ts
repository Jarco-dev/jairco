import { SenderMessageOptions, SenderReplyMethod } from "@/types";

export interface SenderReplyOptions extends SenderMessageOptions {
    method?: SenderReplyMethod;
    langType?: "EMBED" | "STRING";
    langLocation?: string;
    langVariables?: { [key: string]: string };
}
