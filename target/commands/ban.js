"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BanCommand = void 0;
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const PermissionUtil_1 = require("../util/PermissionUtil");
const Ban_1 = require("../moderation/actions/Ban");
const humanize_duration_1 = __importDefault(require("humanize-duration"));
class BanCommand extends framework_1.Command {
    // -------------------------------------------- //
    // CONSTRUCT
    // -------------------------------------------- //
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'ban',
            description: 'Ban a user',
            runIn: "GUILD_ANY" /* GuildAny */,
            requiredClientPermissions: ["BAN_MEMBERS"]
        });
    }
    // Register slash command
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand(builder => builder
            .setName('ban')
            .setDescription('Ban a user')
            .addUserOption(option => option
            .setName('user')
            .setDescription('Choose a user to ban')
            .setRequired(true))
            .addStringOption(option => option
            .setName('reason')
            .setDescription('Record a reason for this ban')
            .setRequired(true))
            .addStringOption(option => option
            .setName('duration')
            .setDescription('Duration for this ban \'Examples: \`10m\` \`1h\` \`45m\` \`24h\` \'')
            .setRequired(false))
            .addBooleanOption(option => option
            .setName('silent')
            .setDescription('Whether to show this moderation action in chat')
            .setRequired(false))
            .setDefaultMemberPermissions(discord_js_1.Permissions.FLAGS.MUTE_MEMBERS));
    }
    // Run via slash command
    async chatInputRun(interaction) {
        // Generate a Ban object from this the interaction
        const ban = await Ban_1.Ban.interactionFactory(interaction);
        // If for some reason this interaction cannot be turned into a proper ban (for example command parameters that cannot be parsed into something meaningful)
        // Then the factory will have already responded with an error message, and we should just exit
        if (!ban)
            return;
        // Perform critical permission checks
        const error = await PermissionUtil_1.PermissionUtil.checkPermissions(ban, { checkTargetIsBelowIssuer: true, checkTargetIsBelowClient: true, checkIssuerHasPerm: "BAN_MEMBERS" });
        // Handle a permission error, if any exists
        if (error) {
            // Send the user the error message
            await interaction.reply({ content: error.message, ephemeral: true });
            // Exit
            return;
        }
        //Unlike the other moderation action classes, this action must be executed in a special order because user's cannot be messaged after they are banned
        //I don't like doing things this way, but we have no choice to first record to the db, then message, then ban
        const success = await ban.recordToDb() && await ban.messageTarget() && await ban.perform();
        if (success) {
            await interaction.reply({
                content: `@${ban.target.tag} muted ${ban._duration ? `for **${(0, humanize_duration_1.default)(ban._duration)}**` : ''}`,
                ephemeral: ban.silent
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
exports.BanCommand = BanCommand;
