import "dotenv/config";
import { LogLevel } from "@/types";
import { Logger } from "@/classes";

export class SecretConfig {
    public DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string;
    public DATABASE_URL = process.env.DATABASE_URL as string;
    public SHADOW_DATABASE_URL = process.env.SHADOW_DATABASE_URL as
        | string
        | undefined;
    public REDIS_HOST = process.env.REDIS_HOST as string;
    public REDIS_PORT = parseInt(process.env.REDIS_PORT ?? "NaN");
    public REDIS_USER = process.env.REDIS_USER as string;
    public REDIS_PASSWORD = process.env.REDIS_PASSWORD as string;
    public REDIS_DATABASE = parseInt(process.env.REDIS_DATABASE ?? "NaN");
    public LOG_LEVEL = process.env.LOG_LEVEL as LogLevel;
    public METRICS_PORT = parseInt(process.env.METRICS_PORT ?? "NaN");

    constructor() {}

    public validate(logger: Logger) {
        const errors: string[] = [];

        if (!this.DISCORD_BOT_TOKEN) {
            errors.push("DISCORD_BOT_TOKEN is required but not given");
        }

        if (!this.DATABASE_URL) {
            errors.push("DATABASE_URL is required but not given");
        }

        if (!this.REDIS_HOST) {
            errors.push("REDIS_HOST is required but not given");
        }

        if (!this.REDIS_PORT) {
            errors.push("REDIS_PORT is required but not given");
        } else if (isNaN(this.REDIS_PORT)) {
            errors.push("REDIS_PORT is a invalid number");
        }

        if (!this.REDIS_USER) {
            errors.push("REDIS_USER is required but not given");
        }

        if (!this.REDIS_PASSWORD) {
            errors.push("REDIS_PASSWORD is required but not given");
        }

        if (!this.REDIS_DATABASE && this.REDIS_DATABASE !== 0) {
            errors.push("REDIS_DATABASE is required but not given");
        } else if (isNaN(this.REDIS_DATABASE)) {
            errors.push("REDIS_DATABASE is a invalid number");
        }

        if (!this.LOG_LEVEL) {
            errors.push("LOG_LEVEL is required but not given");
        } else if (
            !["VERBOSE", "DEBUG", "INFO", "WARN", "ERROR"].includes(
                this.LOG_LEVEL
            )
        ) {
            errors.push("LOG_LEVEL is a invalid value");
        }

        if (!this.METRICS_PORT) {
            errors.push("METRICS_PORT is required but not given");
        } else if (isNaN(this.METRICS_PORT)) {
            errors.push("METRICS_PORT is a invalid value");
        }

        if (errors.length > 0) {
            logger.warn(
                ...errors.reduce((a: string[], e) => {
                    a.push(`The .env value ${e}`);
                    return a;
                }, [])
            );
            process.exit(0); // eslint-disable-line
        }
    }
}
