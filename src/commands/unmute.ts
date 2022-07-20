import {ChatInputCommand, Command, CommandOptionsRunTypeEnum} from "@sapphire/framework";
import {Permissions} from "discord.js";
import {Unmute} from "../moderation/actions/Unmute";

export class UnmuteCommand extends Command
{
    // -------------------------------------------- //
    // CONSTRUCT
    // -------------------------------------------- //
    public constructor(context: Command.Context, options: Command.Options)
    {
        super(context, {
            ...options,
            name: 'unmute',
            description: "Remove a user's time out",
            runIn: CommandOptionsRunTypeEnum.GuildAny,
            preconditions: ['CanMute'],
            requiredClientPermissions: ['MUTE_MEMBERS']
        });
    }

    // Register slash command
    public override registerApplicationCommands(registry: ChatInputCommand.Registry)
    {
        registry.registerChatInputCommand(builder =>

            builder
                .setName('unmute')
                .setDescription("Remove a user's time out")

                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('Choose a user to remove their mute')
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('Record a reason for this unmute')
                        .setRequired(true)
                )

                .addBooleanOption(option =>
                    option
                        .setName('silent')
                        .setDescription('Whether to show this moderation action in chat')
                        .setRequired(false)
                )

                .setDefaultMemberPermissions(Permissions.FLAGS.MUTE_MEMBERS)
        );
    }

    // Run via slash command
    public async chatInputRun(interaction: Command.ChatInputInteraction)
    {
        // Generate a Unmute object from the interaction
        const unmute = Unmute.interactionFactory(interaction);

        // Perform the Unmute
        const success: boolean = await unmute.perform();

        if (success)
        {
            await interaction.reply({
                content: `@${unmute.target.tag} unmuted`,
                ephemeral: unmute.silent
            });
        } else
        {
            await interaction.reply({
                content: 'Error: command did not execute successfully',
                ephemeral: true
            })
        }
    }
}