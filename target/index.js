"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const framework_1 = require("@sapphire/framework");
const client = new framework_1.SapphireClient({
    intents: ['GUILDS', 'GUILD_MESSAGES'],
    partials: ['MESSAGE', 'REACTION', 'CHANNEL', 'GUILD_MEMBER'],
    loadMessageCommandListeners: true,
});
client.login(process.env.TOKEN);
