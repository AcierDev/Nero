import {ChatInputCommand, Command, CommandOptionsRunTypeEnum} from "@sapphire/framework";
import {Permissions} from "discord.js";
import {Mute} from "../moderation/Mute";
import humanize from 'humanize-duration';

export class MuteCommand extends Command
{
    //Construct
    public constructor(context: Command.Context, options: Command.Options)
    {
        super(context, {
            ...options,
            name: 'mute',
            description: "time out a user",
            runIn: CommandOptionsRunTypeEnum.GuildAny,
            preconditions: ['CanMute'],
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
        )
    }

    // Run via slash command
    public async chatInputRun(interaction: Command.ChatInputInteraction)
    {
        const mute = await Mute.interactionFactory(interaction);

        const success: boolean = await mute.execute();

        if (success)
        {
            await interaction.reply({content: `@${mute.target.tag} muted for ${humanize(mute.duration)}`, ephemeral: mute.silent
            });
        } else
        {
            await interaction.reply({content: 'Error: command did not execute successfully', ephemeral: true})
        }
    }
}