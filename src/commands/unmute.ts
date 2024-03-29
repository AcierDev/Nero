import {ChatInputCommand, Command, CommandOptionsRunTypeEnum, err} from "@sapphire/framework";
import {Permissions} from "discord.js";
import {Unmute} from "../moderation/actions/Unmute";
import {ModActionExecutor} from "../moderation/ModActionExecutor";

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
            description: "Remove a user's mute",
            runIn: CommandOptionsRunTypeEnum.GuildAny,
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
        await interaction.deferReply({ephemeral: interaction.options.getBoolean('silent')})

        // Create an unmute instance from the interaction
        const unmute = await Unmute.interactionFactory(interaction);

        // Attempt to execute the action in the guild
        await ModActionExecutor.execute(unmute, interaction)
    }
}