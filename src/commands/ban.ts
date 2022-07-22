import {ChatInputCommand, Command, CommandOptionsRunTypeEnum, err} from "@sapphire/framework";
import {Permissions} from "discord.js";
import {PermissionUtil} from "../util/PermissionUtil";
import {Ban} from "../moderation/actions/Ban";
import humanize from 'humanize-duration';

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

                .setDefaultMemberPermissions(Permissions.FLAGS.MUTE_MEMBERS)
        );
    }

    // Run via slash command
    public async chatInputRun(interaction: Command.ChatInputInteraction)
    {
        // Generate a Ban object from this the interaction
        const ban = await Ban.interactionFactory(interaction);
        // If for some reason this interaction cannot be turned into a proper ban (for example command parameters that cannot be parsed into something meaningful)
        // Then the factory will have already responded with an error message, and we should just exit
        if (! ban) return;
        // Perform critical permission checks
        const error = await PermissionUtil.checkPermissions(ban, {checkTargetIsBelowIssuer: true, checkTargetIsBelowClient: true, checkIssuerHasPerm: "BAN_MEMBERS"})
        // Handle a permission error, if any exists
        if (error)
        {
            // Send the user the error message
            await interaction.reply({content: error.message, ephemeral: true});
            // Exit
            return;
        }

        //Unlike the other moderation action classes, this action must be executed in a special order because user's cannot be messaged after they are banned
        //I don't like doing things this way, but we have no choice to first record to the db, then message, then ban
        //FIXME
        const success: boolean = await ban.recordToDb() && await ban.messageTarget() && await ban.perform();

        if (success)
        {
            await interaction.reply({
                content: `@${ban.target.tag} banned ${ban._duration ? `for **${humanize(ban._duration)}**` : ''}`,
                ephemeral: ban.silent
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