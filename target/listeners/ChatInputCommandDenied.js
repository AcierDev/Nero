"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatInputCommandDenied = void 0;
const framework_1 = require("@sapphire/framework");
class ChatInputCommandDenied extends framework_1.Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            once: false,
            event: 'chatInputCommandDenied'
        });
    }
    run(error, { interaction }) {
        const silent = Reflect.get(Object(error.context), 'silent') ?? false;
        return interaction.reply({ content: error.message, ephemeral: silent });
    }
}
exports.ChatInputCommandDenied = ChatInputCommandDenied;
