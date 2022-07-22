import {ChatInputCommand, Command} from "@sapphire/framework";
import {Message} from "discord.js";
import {isMessageInstance} from '@sapphire/discord.js-utilities';

export class PingCommand extends Command
{
    // Construct
    public constructor(context: Command.Context, options: Command.Options)
    {
        super(context, {
            ...options,
            name: 'ping',
            description: "get the bots ping and API latency"
        });
    }

    // Register Slash Command
    public override registerApplicationCommands(registry: ChatInputCommand.Registry)
    {
        registry.registerChatInputCommand(builder =>
            builder
                .setName('ping')
                .setDescription("get the bots ping and API latency")
        )
    }

    // Run via text command
    public async messageRun(message: Message)
    {
        // Initial reply
        const msg = await message.reply('pong');

        // edit reply to include websocket ping and API latency
        return msg.edit(`Bots ping: ${this.container.client.ws.ping}ms.\nAPI latency: ${msg.createdTimestamp - message.createdTimestamp}ms.`)
    }

    // Run via slash command
    public async chatInputRun(interaction: Command.ChatInputInteraction)
    {
        // Initial reply
        const sentMsg = await interaction.reply({content: 'pong', ephemeral: true, fetchReply: true});

        // ensure we were returned a Message and not an APIMessage
        if (isMessageInstance(sentMsg))
        {
            // Edit reply to include websocket ping and API latency
            return interaction.editReply(`Bots ping: ${this.container.client.ws.ping}ms.\nAPI latency: ${sentMsg.createdTimestamp - interaction.createdTimestamp}ms.`)
        }

        //Error case
        return interaction.editReply(`Could not fetch the bots ping. Contact Acier`);
    }
}