import {ChatInputCommand, Command, CommandOptionsRunTypeEnum, err} from "@sapphire/framework";
import {Permissions} from "discord.js";
import {Unmute} from "../moderation/actions/Unmute";
import {PermissionUtil} from "../util/PermissionUtil";

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
        // Perform critical permission checks
        const error = await PermissionUtil.checkPermissions(unmute, {checkTargetIsBelowIssuer: true, checkTargetIsBelowClient: true, checkIssuerHasPerm: "MUTE_MEMBERS"})
        // Handle a permission error, if any exists
        if (error)
        {
            // Send the user the error message
            await interaction.reply({content: error.message, ephemeral: true});
            // Exit
            return;
        }
        // execute the Unmute
        const success: boolean = await unmute.execute();

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