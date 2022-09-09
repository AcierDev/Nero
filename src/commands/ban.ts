import {ChatInputCommand, Command, CommandOptionsRunTypeEnum, err} from "@sapphire/framework";
import {Permissions} from "discord.js";
import {Ban} from "../moderation/actions/Ban";
import humanize from 'humanize-duration';
import {ModActionExecutor} from "../moderation/ModActionExecutor";

export class BanCommand extends Command
{
    // -------------------------------------------- //
    // CONSTRUCT
    // -------------------------------------------- //
    public constructor(context: Command.Context, options: Command.Options)
    {
        super(context, {
            ...options,
            name: 'ban',
            description: 'Ban a user from the server',
            runIn: CommandOptionsRunTypeEnum.GuildAny,
            requiredClientPermissions: ["BAN_MEMBERS"]
        })
    }

    // Register slash command
    public override registerApplicationCommands(registry: ChatInputCommand.Registry)
    {
        registry.registerChatInputCommand(builder =>
            builder
                .setName('ban')
                .setDescription('Ban a user')

                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('Choose a user to ban')
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('Record a reason for this ban')
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName('duration')
                        .setDescription('Duration for this ban \'Examples: \`10m\` \`1h\` \`45m\` \`24h\` \'')
                        .setRequired(false)
                )

                .addBooleanOption(option =>
                    option
                        .setName('silent')
                        .setDescription('Whether to show this moderation action in chat')
                        .setRequired(false)
                )

                .setDefaultMemberPermissions(Permissions.FLAGS.BAN_MEMBERS)
        );
    }

    // Run via slash command
    public async chatInputRun(interaction: Command.ChatInputInteraction)
    {
        await interaction.deferReply()

        // Generate a Ban object from this the interaction
        const ban = await Ban.interactionFactory(interaction);

        // If for some reason this interaction cannot be turned into a proper ban (for example command parameters that cannot be parsed into something meaningful)
        // Then the factory will have already responded with an error message, and we should just exit
        if (!ban) return;

        // Attempt to execute the action in the guild
        await ModActionExecutor.execute(ban, interaction)
    }
}