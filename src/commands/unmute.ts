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
        // Create an unmute instance from the interaction
        const unmute = Unmute.interactionFactory(interaction);
        // If for some reason this interaction cannot be turned into a proper unmute (for example command parameters that cannot be parsed into something meaningful)
        // Then the factory will have already responded with an error message, and we should just exit
        if (! unmute) return;

        // Attempt to execute the action in the guild
        await ModActionExecutor.execute(
            unmute,
            {checkTargetIsBelowIssuer: true, checkTargetIsBelowClient: true, checkIssuerHasPerm: "MUTE_MEMBERS"},
            {checkTargetIsInGuild: true},
            () =>
            {
                return `@**${unmute.target.tag}** unmuted`
            },
            interaction
        )
    }
}