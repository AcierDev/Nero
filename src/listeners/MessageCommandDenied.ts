import {Listener, MessageCommandDeniedPayload, UserError} from "@sapphire/framework";

export class MessageCommandDenied extends Listener
{
    public constructor(context: Listener.Context, options: Listener.Options)
    {
        super(context, {
            ...options,
            once: false,
            event: 'messageCommandDenied'
        });
    }

    public run(error: UserError, {message}: MessageCommandDeniedPayload)
    {
        if (Reflect.get(Object(error.context), 'silent')) return;
        return message.reply(error.message);
    }
}