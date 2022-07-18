import {ChatInputCommand, Command, CommandOptionsRunTypeEnum} from "@sapphire/framework";
import {Permissions} from "discord.js";

export class WarnCommand extends Command {
    //Construct
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'warn',
            description: "issue a user a warning",
            runIn: CommandOptionsRunTypeEnum.GuildAny,
            preconditions: ['canMute']
        });
    }

    // Register slash command
    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
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


}