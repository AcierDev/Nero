import {ChatInputCommand, Command, CommandOptionsRunTypeEnum, err} from "@sapphire/framework";
import {Permissions} from "discord.js";
import {Kick} from "../moderation/actions/Kick";
import {ModActionExecutor} from "../moderation/ModActionExecutor";

export class KickCommand extends Command
{
    //Construct
    public constructor(context: Command.Context, options: Command.Options)
    {
        super(context, {
            ...options,
            name: 'kick',
            description: "Kick a user from the server",
            runIn: CommandOptionsRunTypeEnum.GuildAny,
        });
    }

    // Register slash command
    public override registerApplicationCommands(registry: ChatInputCommand.Registry)
    {
        registry.registerChatInputCommand(builder =>
            builder
                .setName('kick')
                .setDescription('kick a user from the server')

                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('Choose a user to kick')
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('Record a reason for this kick')
                        .setRequired(true)
                )

                .addBooleanOption(option =>
                    option
                        .setName('silent')
                        .setDescription('Whether to show this moderation action in chat')
                        .setRequired(false)
                )

                .setDefaultMemberPermissions(Permissions.FLAGS.KICK_MEMBERS)
        )
    }

    // Run via slash command
    public async chatInputRun(interaction: Command.ChatInputInteraction)
    {
        await interaction.deferReply({ephemeral: interaction.options.getBoolean('silent')})

        // Create a Kick object from this interaction
        const kick = await Kick.interactionFactory(interaction);

        // Attempt to execute the action in the guild
        await ModActionExecutor.execute(kick, interaction)
    }
}