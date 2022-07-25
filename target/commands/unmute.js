"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnmuteCommand = void 0;
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const Unmute_1 = require("../moderation/actions/Unmute");
const PermissionUtil_1 = require("../util/PermissionUtil");
class UnmuteCommand extends framework_1.Command {
    // -------------------------------------------- //
    // CONSTRUCT
    // -------------------------------------------- //
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'unmute',
            description: "Remove a user's time out",
            runIn: "GUILD_ANY" /* GuildAny */,
            requiredClientPermissions: ['MUTE_MEMBERS']
        });
    }
    // Register slash command
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand(builder => builder
            .setName('unmute')
            .setDescription("Remove a user's time out")
            .addUserOption(option => option
            .setName('user')
            .setDescription('Choose a user to remove their mute')
            .setRequired(true))
            .addStringOption(option => option
            .setName('reason')
            .setDescription('Record a reason for this unmute')
            .setRequired(true))
            .addBooleanOption(option => option
            .setName('silent')
            .setDescription('Whether to show this moderation action in chat')
            .setRequired(false))
            .setDefaultMemberPermissions(discord_js_1.Permissions.FLAGS.MUTE_MEMBERS));
    }
    // Run via slash command
    async chatInputRun(interaction) {
        // Create an unmute instance from the interaction
        const unmute = Unmute_1.Unmute.interactionFactory(interaction);
        // If for some reason this interaction cannot be turned into a proper unmute (for example command parameters that cannot be parsed into something meaningful)
        // Then the factory will have already responded with an error message, and we should just exit
        if (!unmute)
            return;
        // Perform critical permission checks
        const error = await PermissionUtil_1.PermissionUtil.checkPermissions(unmute, { checkTargetIsBelowIssuer: true, checkTargetIsBelowClient: true, checkIssuerHasPerm: "MUTE_MEMBERS" });
        // Handle a permission error, if any exists
        if (error) {
            // Send the user the error message
            await interaction.reply({ content: error.message, ephemeral: true });
            // Exit
            return;
        }
        // execute the Unmute
        const success = await unmute.execute();
        if (success) {
            await interaction.reply({
                content: `@${unmute.target.tag} unmuted`,
                ephemeral: unmute.silent
            });
        }
        else {
            await interaction.reply({
                content: 'CommandError: command did not execute successfully',
                ephemeral: true
            });
        }
    }
}
exports.UnmuteCommand = UnmuteCommand;
