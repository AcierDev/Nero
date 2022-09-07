import {ChatInputCommand, Command, CommandOptionsRunTypeEnum} from "@sapphire/framework";
import {Permissions} from "discord.js";
import {Ban} from "../moderation/actions/Ban";
import {ModActionExecutor} from "../moderation/ModActionExecutor";
import {Unban} from "../moderation/actions/Unban";

export class UnbanCommand extends Command
{
    // -------------------------------------------- //
    // CONSTRUCT
    // -------------------------------------------- //
    public constructor(context: Command.Context, options: Command.Options)
    {
        super(context, {
            ...options,
            name: 'unban',
            description: 'Unban a user from the server',
            runIn: CommandOptionsRunTypeEnum.GuildAny,
            requiredClientPermissions: ["BAN_MEMBERS"]
        })
    }

    // Register slash command
    public override registerApplicationCommands(registry: ChatInputCommand.Registry)
    {
        registry.registerChatInputCommand(builder =>
            builder
                .setName('unban')
                .setDescription('Unban a user from the server')

                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('Choose a user to unban')
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('Record a reason for this unban')
                        .setRequired(true)
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
        // Generate a Ban object from this the interaction
        const unban = await Unban.interactionFactory(interaction);

        // Attempt to execute the action in the guild
        await ModActionExecutor.execute(unban, interaction)
    }
}