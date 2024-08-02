import { Linguini, TypeMappers, Utils } from "linguini";
import path from "path";
import { EmbedBuilder, LocaleString, resolveColor } from "discord.js";
import { Client } from "./Client";

export class LanguageManager {
    private client: Client;

    private readonly linguini = new Linguini(
        path.join(__dirname, "../../lang"),
        "lang"
    );
    public readonly default: LocaleString = "en-US";
    private readonly available: LocaleString[] = ["en-US", "nl"];

    constructor(client: Client) {
        this.client = client;
    }

    public getString(
        locale: LocaleString,
        location: string,
        variables?: { [name: string]: string }
    ): string {
        return this.linguini.get(
            location,
            this.getLocale(locale),
            TypeMappers.String,
            variables
        );
    }

    public getCommon(
        location: string,
        variables?: { [name: string]: string }
    ): string {
        return this.linguini.getCom(location, variables);
    }

    public getEmbed(
        locale: LocaleString,
        location: string,
        variables?: { [name: string]: string }
    ): EmbedBuilder {
        return this.linguini.get(
            location,
            this.getLocale(locale),
            this.embedTypeMapper,
            variables
        );
    }

    private getLocale(locale: LocaleString): LocaleString {
        return this.available.includes(locale) ? locale : this.default;
    }

    private embedTypeMapper = (jsonValue: any): EmbedBuilder => {
        return new EmbedBuilder({
            author: jsonValue.author,
            title: Utils.join(jsonValue.title, "\n"),
            url: jsonValue.url,
            thumbnail: {
                url: jsonValue.thumbnail
            },
            description: Utils.join(jsonValue.description, "\n"),
            fields: jsonValue.fields?.map((field: any) => ({
                name: Utils.join(field.name, "\n"),
                value: Utils.join(field.value, "\n"),
                inline: field.inline ? field.inline : false
            })),
            image: {
                url: jsonValue.image
            },
            footer: {
                text:
                    Utils.join(jsonValue.footer?.text, "\n") ??
                    `${this.client.user!.username} v${
                        this.client.config.VERSION
                    }`,
                iconURL: jsonValue.footer?.icon
            },
            timestamp: jsonValue.timestamp ? Date.now() : undefined,
            color: resolveColor(
                jsonValue.color ?? this.getCommon("colors.default")
            )
        });
    };
}
