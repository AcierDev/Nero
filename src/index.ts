import { SapphireClient } from "@sapphire/framework";
require('dotenv').config();

const client = new SapphireClient({
    intents: ['GUILDS', 'GUILD_MESSAGES'],
    partials: ['MESSAGE', 'REACTION', 'CHANNEL', 'GUILD_MEMBER'],
    loadMessageCommandListeners: true,
});

console.log(process.env.TOKEN);

client.login(process.env.TOKEN);