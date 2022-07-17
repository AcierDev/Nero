"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PingCommand = void 0;
const framework_1 = require("@sapphire/framework");
class PingCommand extends framework_1.Command {
    // Construct
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'ping',
            description: "get the bot's ping and API latency"
        });
    }
    // On run
    async messageRun(message) {
        // Initial reply
        const msg = await message.reply('pong');
        // edit reply to include websocket ping and API latency
        return msg.edit(`Bot ping: ${this.container.client.ws.ping}ms.
        API latency: ${msg.createdTimestamp - message.createdTimestamp}ms.`);
    }
}
exports.PingCommand = PingCommand;
