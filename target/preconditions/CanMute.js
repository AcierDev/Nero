"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanMute = void 0;
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const discord_js_utilities_1 = require("@sapphire/discord.js-utilities");
class CanMute extends framework_1.AllFlowsPrecondition {
    // Chat command
    async messageRun(message) {
        return this.canMute(message.member);
    }
    // Slash command
    async chatInputRun(interaction) {
        // Ensure they are a GuildMember so we can check their permissions
        if ((0, discord_js_utilities_1.isGuildMember)(interaction.member)) {
            // Check permissions
            return this.canMute(interaction.member);
        }
        else {
            return this.error({ message: `Error: You do not seem to be running this command from inside a discord server` });
        }
    }
    //Context menu command
    async contextMenuRun(interaction) {
        // Ensure they are a GuildMember so we can check their permissions
        if ((0, discord_js_utilities_1.isGuildMember)(interaction.member)) {
            // Check permissions
            return this.canMute(interaction.member);
        }
        else {
            return this.error({ message: `Error: You do not seem to be running this command from inside a discord server` });
        }
    }
    /**
     * Check if a GuildMember has access to mute user's in their guild
     */
    async canMute(member) {
        return member.permissions.has(discord_js_1.Permissions.FLAGS.MUTE_MEMBERS)
            ? this.ok()
            : this.error({ message: `You must have the permission: \`Mute Members\`` });
    }
}
exports.CanMute = CanMute;
