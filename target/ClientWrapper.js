"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientWrapper = void 0;
const framework_1 = require("@sapphire/framework");
class ClientWrapper {
    static instance = null;
    static get() {
        if (ClientWrapper.instance)
            return ClientWrapper.instance;
        else {
            ClientWrapper.instance = new framework_1.SapphireClient({
                intents: ['GUILDS', 'GUILD_MESSAGES'],
                partials: ['MESSAGE', 'REACTION', 'CHANNEL', 'GUILD_MEMBER'],
                loadMessageCommandListeners: true,
            });
            return ClientWrapper.instance;
        }
    }
}
exports.ClientWrapper = ClientWrapper;
