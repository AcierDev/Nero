import {ChatInputCommandDeniedPayload, Listener, MessageCommandDeniedPayload, UserError} from "@sapphire/framework";

export class ChatInputCommandDenied extends Listener
{
    public constructor(context: Listener.Context, options: Listener.Options)
    {
        super(context, {
            ...options,
            once: false,
            event: 'chatInputCommandDenied'
        });
    }

    public run(error: UserError, {interaction}: ChatInputCommandDeniedPayload)
    {
        const silent = Reflect.get(Object(error.context), 'silent') ?? false;
        return interaction.reply({content: error.message, ephemeral: silent});
    }
}