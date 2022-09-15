import {ChatInputCommand, Command, CommandOptionsRunTypeEnum} from "@sapphire/framework";
import {Message, Permissions} from "discord.js";
import {DbManager} from "../db/DbManager";
import {HistoryUtil} from "../util/HistoryUtil";

export class HistoryCommand extends Command
{
    // -------------------------------------------- //
    // CONSTRUCT
    // -------------------------------------------- //
    public constructor(context: Command.Context, options: Command.Options)
    {
        super(context, {
            ...options,
            name: 'history',
            aliases: [],
            description: "View a user's moderation history",
            runIn: CommandOptionsRunTypeEnum.GuildAny,
        })
    }

    // Register slash command
    public override registerApplicationCommands(registry: ChatInputCommand.Registry)
    {
        registry.registerChatInputCommand(builder =>
            builder
                .setName('history')
                .setDescription("View a user's moderation history")

                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('Choose a user to view their history. Or leave blank to view the server history')
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
        // Defer reply
        await interaction.deferReply();

        // Fetch the command parameters
        const user = interaction.options.getUser('user', false) ?? null;
        const silent = interaction.options.getBoolean('silent', false) ?? false;

        // Fetch a paginated embed of the user's moderation history, or the guild's moderation history if no user was provided
        const paginated = await HistoryUtil.fetchHistoryEmbed(interaction.guild.id, {userId: user?.id})

        // Send the paginated message
        const sent = await interaction.followUp(paginated.getMessage(silent)) as any

        paginated.createCollector(sent);
    }
}