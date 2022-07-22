"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PingCommand = void 0;
const framework_1 = require("@sapphire/framework");
const discord_js_utilities_1 = require("@sapphire/discord.js-utilities");
class PingCommand extends framework_1.Command {
    // Construct
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'ping',
            description: "get the bots ping and API latency"
        });
    }
    // Register Slash Command
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand(builder => builder
            .setName('ping')
            .setDescription("get the bots ping and API latency"));
    }
    // Run via text command
    async messageRun(message) {
        // Initial reply
        const msg = await message.reply('pong');
        // edit reply to include websocket ping and API latency
        return msg.edit(`Bots ping: ${this.container.client.ws.ping}ms.\nAPI latency: ${msg.createdTimestamp - message.createdTimestamp}ms.`);
    }
    // Run via slash command
    async chatInputRun(interaction) {
        // Initial reply
        const sentMsg = await interaction.reply({ content: 'pong', ephemeral: true, fetchReply: true });
        // ensure we were returned a Message and not an APIMessage
        if ((0, discord_js_utilities_1.isMessageInstance)(sentMsg)) {
            // Edit reply to include websocket ping and API latency
            return interaction.editReply(`Bots ping: ${this.container.client.ws.ping}ms.\nAPI latency: ${sentMsg.createdTimestamp - interaction.createdTimestamp}ms.`);
        }
        //Error case
        return interaction.editReply(`Could not fetch the bots ping. Contact Acier`);
    }
}
exports.PingCommand = PingCommand;
