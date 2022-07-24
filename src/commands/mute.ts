import {ChatInputCommand, Command, CommandOptionsRunTypeEnum, err} from "@sapphire/framework";
import {Permissions} from "discord.js";
import {Mute} from "../moderation/actions/Mute";
import humanize from 'humanize-duration';
import {ModActionExecutor} from "../moderation/ModActionExecutor";

export class MuteCommand extends Command
{
    /// -------------------------------------------- //
    // CONSTRUCT
    // -------------------------------------------- //
    public constructor(context: Command.Context, options: Command.Options)
    {
        super(context, {
            ...options,
            name: 'mute',
            description: "mute a user from all communication",
            runIn: CommandOptionsRunTypeEnum.GuildAny,
            requiredClientPermissions: ['MUTE_MEMBERS'],
        });
    }

    // Register slash command
    public override registerApplicationCommands(registry: ChatInputCommand.Registry)
    {
        registry.registerChatInputCommand(builder =>
            builder
                .setName('mute')
                .setDescription('time out a user')

                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('Choose a user to time out')
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('Record a reason for this mute')
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName('duration')
                        .setDescription('Duration for this mute \'Examples: \`10m\` \`1h\` \`45m\` \`24h\` \'')
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
        // Generate a Mute object from this the interaction
        const mute = await Mute.interactionFactory(interaction);
        // If for some reason this interaction cannot be turned into a proper mute (for example command parameters that cannot be parsed into something meaningful)
        // Then the factory will have already responded with an error message, and we should just exit
        if (! mute) return;

        // Attempt to execute the action in the guild
        await ModActionExecutor.execute(
            mute,
            {checkTargetIsBelowIssuer: true, checkTargetIsBelowClient: true, checkIssuerHasPerm: "MUTE_MEMBERS"},
            {checkTargetIsInGuild: true, checkTargetNotMuted: true},
            () =>
            {
                return `@**${mute.target.tag}** muted for **${humanize(mute._duration)}**`
            },
            interaction
        )
    }
}