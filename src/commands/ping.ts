import { Command } from "@sapphire/framework";
import { Message } from "discord.js";

export class PingCommand extends Command {

    // Construct
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'ping',
            description: "get the bot's ping and API latency"
        });
    }

    // On run
    public async messageRun(message: Message) {
        // Initial reply
        const msg = await message.reply('pong');

        // edit reply to include websocket ping and API latency
        return msg.edit(`Bot's ping: ${this.container.client.ws.ping}ms.\nAPI latency: ${msg.createdTimestamp - message.createdTimestamp}ms.`)
    }
}