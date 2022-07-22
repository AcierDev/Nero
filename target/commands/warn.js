"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarnCommand = void 0;
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const Warning_1 = require("../moderation/actions/Warning");
const PermissionUtil_1 = require("../util/PermissionUtil");
class WarnCommand extends framework_1.Command {
    //Construct
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'warn',
            description: "issue a user a warning",
            runIn: "GUILD_ANY" /* GuildAny */,
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
        // Create a Warning instance from this interaction
        const warning = await Warning_1.Warning.interactionFactory(interaction);
        // Perform critical permission checks
        const error = await PermissionUtil_1.PermissionUtil.checkPermissions(warning, { checkTargetIsBelowIssuer: true, checkIssuerHasPerm: "MUTE_MEMBERS" });
        // Handle a permission error, if any exists
        if (error) {
            // Send the user the error message
            await interaction.reply({ content: error.message, ephemeral: true });
            // Exit
            return;
        }
        // Execute the warning
        const success = await warning.execute();
        if (success) {
            await interaction.reply({ content: `@${warning.target.tag} warned`, ephemeral: warning.silent });
        }
        else {
            await interaction.reply({ content: 'Error: command did not execute successfully', ephemeral: true });
        }
    }
}
exports.WarnCommand = WarnCommand;
