"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuteCommand = void 0;
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const Mute_1 = require("../moderation/actions/Mute");
const humanize_duration_1 = __importDefault(require("humanize-duration"));
const PermissionUtil_1 = require("../util/PermissionUtil");
class MuteCommand extends framework_1.Command {
    /// -------------------------------------------- //
    // CONSTRUCT
    // -------------------------------------------- //
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'mute',
            description: "time out a user",
            runIn: "GUILD_ANY" /* GuildAny */,
            requiredClientPermissions: ['MUTE_MEMBERS'],
        });
    }
    // Register slash command
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand(builder => builder
            .setName('mute')
            .setDescription('time out a user')
            .addUserOption(option => option
            .setName('user')
            .setDescription('Choose a user to time out')
            .setRequired(true))
            .addStringOption(option => option
            .setName('reason')
            .setDescription('Record a reason for this mute')
            .setRequired(true))
            .addStringOption(option => option
            .setName('duration')
            .setDescription('Duration for this mute \'Examples: \`10m\` \`1h\` \`45m\` \`24h\` \'')
            .setRequired(true))
            .addBooleanOption(option => option
            .setName('silent')
            .setDescription('Whether to show this moderation action in chat')
            .setRequired(false))
            .setDefaultMemberPermissions(discord_js_1.Permissions.FLAGS.MUTE_MEMBERS));
    }
    // Run via slash command
    async chatInputRun(interaction) {
        // Generate a Mute object from this the interaction
        const mute = await Mute_1.Mute.interactionFactory(interaction);
        // If for some reason this interaction cannot be turned into a proper mute (for example command parameters that cannot be parsed into something meaningful)
        // Then the factory will have already responded with an error message, and we should just exit
        if (!mute)
            return;
        // Perform critical permission checks
        const error = await PermissionUtil_1.PermissionUtil.checkPermissions(mute, { ensureTargetIsInGuild: true, checkTargetIsBelowIssuer: true, checkTargetIsBelowClient: true, checkIssuerHasPerm: "MUTE_MEMBERS" });
        // Handle a permission error, if any exists
        if (error) {
            // Send the user the error message
            await interaction.reply({ content: error.message, ephemeral: true });
            // Exit
            return;
        }
        // Execute the Mute
        const success = await mute.execute();
        if (success) {
            await interaction.reply({
                content: `@${mute.target.tag} muted for ${(0, humanize_duration_1.default)(mute._duration)}`,
                ephemeral: mute.silent
            });
        }
        else {
            await interaction.reply({
                content: 'Error: command did not execute successfully',
                ephemeral: true
            });
        }
    }
}
exports.MuteCommand = MuteCommand;
