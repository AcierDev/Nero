import {ChatInputCommand, Command, CommandOptionsRunTypeEnum} from "@sapphire/framework";
import {Permissions} from "discord.js";
import {Warning} from "../moderation/actions/Warning";

export class WarnCommand extends Command
{
    //Construct
    public constructor(context: Command.Context, options: Command.Options)
    {
        super(context, {
            ...options,
            name: 'warn',
            description: "issue a user a warning",
            runIn: CommandOptionsRunTypeEnum.GuildAny,
            preconditions: ['CanMute']
        });
    }

    // Register slash command
    public override registerApplicationCommands(registry: ChatInputCommand.Registry)
    {
        registry.registerChatInputCommand(builder =>
            builder
                .setName('warn')
                .setDescription('issue a user a warning')

                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('Choose a user to warn')
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('Record a reason for this warning')
                        .setRequired(true)
                )

                .addBooleanOption(option =>
                    option
                        .setName('silent')
                        .setDescription('Whether to show this moderation action in chat')
                        .setRequired(false)
                )

                .setDefaultMemberPermissions(Permissions.FLAGS.MUTE_MEMBERS)
        )
    }

    // Run via slash command
    public async chatInputRun(interaction: Command.ChatInputInteraction)
    {
        const warning = await Warning.interactionFactory(interaction);

        const success: boolean = await warning.execute();

        if (success)
        {
            await interaction.reply({content: `@${warning.target.tag} warned`, ephemeral: warning.silent});
        } else
        {
            await interaction.reply({content: 'Error: command did not execute successfully', ephemeral: true})
        }
    }
}