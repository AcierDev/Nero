"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarnCommand = void 0;
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const Warning_1 = require("../moderation/Warning");
class WarnCommand extends framework_1.Command {
    //Construct
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'warn',
            description: "issue a user a warning",
            runIn: "GUILD_ANY" /* GuildAny */,
            preconditions: ['canMute']
        });
    }
    // Register slash command
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand(builder => builder
            .setName('warn')
            .setDescription('issue a user a warning')
            .addUserOption(option => option
            .setName('user')
            .setDescription('Choose a user to warn')
            .setRequired(true))
            .addStringOption(option => option
            .setName('reason')
            .setDescription('Record a reason for this warning')
            .setRequired(true))
            .addBooleanOption(option => option
            .setName('silent')
            .setDescription('Whether to show this moderation action in chat')
            .setRequired(false))
            .setDefaultMemberPermissions(discord_js_1.Permissions.FLAGS.MUTE_MEMBERS));
    }
    // Run via slash command
    async chatInputRun(interaction) {
        // get the command arguments
        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason', true);
        const silent = interaction.options.getBoolean('silent', true);
        await new Warning_1.Warning(user, reason, interaction.user, Date.now(), interaction.guild, interaction.channel, silent).run();
    }
}
exports.WarnCommand = WarnCommand;
