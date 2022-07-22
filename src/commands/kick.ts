import {ChatInputCommand, Command, CommandOptionsRunTypeEnum, err} from "@sapphire/framework";
import {Permissions} from "discord.js";
import {Warning} from "../moderation/actions/Warning";
import {PermissionUtil} from "../util/PermissionUtil";
import {Kick} from "../moderation/actions/Kick";

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
        // Create a Kick object from this interaction
        const kick = await Kick.interactionFactory(interaction);
        // Perform critical permission checks
        const error = await PermissionUtil.checkPermissions(kick, {ensureTargetIsInGuild: true, checkTargetIsBelowIssuer: true, checkIssuerHasPerm: "KICK_MEMBERS"})
        // Handle a permission error, if any exists
        if (error)
        {
            // Send the user the error message
            await interaction.reply({content: error.message, ephemeral: true});
            // Exit
            return;
        }
        // Execute the Kick
        const success: boolean = await kick.execute();

        if (success)
        {
            await interaction.reply({content: `@${kick.target.tag} kicked`, ephemeral: kick.silent});
        } else
        {
            await interaction.reply({content: 'Error: command did not execute successfully', ephemeral: true})
        }
    }
}