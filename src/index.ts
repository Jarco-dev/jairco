import { Client } from "@/classes";

const client = new Client();
export default client;

// Fix console being ugly on pterodactyl
console.log("\n");

(async () => {
    // Download Dutch word list for word snake game
    client.logger.info("Downloading Dutch word list")
    const fs = require('fs');
    const { Readable } = require('stream');
    const { finished } = require('stream/promises');
    const url = "https://raw.githubusercontent.com/OpenTaal/opentaal-wordlist/refs/tags/2.20.19/elements/basiswoorden-gekeurd.txt"
    const fileName = client.config.WORD_LIST_PATH;
    const resp = await fetch(url);
    if (resp.ok && resp.body) {
        client.logger.info("Writing Dutch word list to file:", fileName)
        let stream = fs.createWriteStream(fileName);
        await finished(Readable.fromWeb(resp.body).pipe(stream));
    } else {
        client.logger.error(
            "Could not download Dutch word list from", url
        )
    }
  })();

// Authorise the bot
client.logger.info("Connecting to discord...");
client.login(client.sConfig.DISCORD_BOT_TOKEN);

// Catch any uncaught errors
process.on("uncaughtException", err => {
    client.logger.error("Uncaught exception in process#uncaughtException", err);
});

process.on("unhandledRejection", err => {
    client.logger.error(
        "Unhandled rejection in process#unhandledRejection",
        err
    );
});
