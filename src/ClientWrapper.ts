import {SapphireClient} from "@sapphire/framework";

export class ClientWrapper
{
    private static instance: SapphireClient = null;

    public static get()
    {
        if (ClientWrapper.instance)
            return ClientWrapper.instance;
        else
        {
            ClientWrapper.instance = new SapphireClient({
                intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS'],
                partials: ['MESSAGE', 'REACTION', 'CHANNEL', 'GUILD_MEMBER'],
                loadMessageCommandListeners: true,
            });

            return ClientWrapper.instance;
        }
    }
}