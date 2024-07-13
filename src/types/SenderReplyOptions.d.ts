import { SenderMessageOptions, SenderReplyMethod } from "@/types";

export interface SenderReplyOptions extends SenderMessageOptions {
    method?: SenderReplyMethod;
    langLocation?: string;
    langType?: LangContentType;
    langVariables?: { [key: string]: string };
}
