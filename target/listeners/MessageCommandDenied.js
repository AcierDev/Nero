"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageCommandDenied = void 0;
const framework_1 = require("@sapphire/framework");
class MessageCommandDenied extends framework_1.Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            once: false,
            event: 'messageCommandDenied'
        });
    }
    run(error, { message }) {
        if (Reflect.get(Object(error.context), 'silent'))
            return;
        return message.reply(error.message);
    }
}
exports.MessageCommandDenied = MessageCommandDenied;
