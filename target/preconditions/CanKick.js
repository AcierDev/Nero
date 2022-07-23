"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanKick = void 0;
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const discord_js_utilities_1 = require("@sapphire/discord.js-utilities");
class CanKick extends framework_1.AllFlowsPrecondition {
    // Chat command
    async messageRun(message) {
        return this.canKick(message.member);
    }
    // Slash command
    async chatInputRun(interaction) {
        // Ensure they are a GuildMember, so we can check their command
        if ((0, discord_js_utilities_1.isGuildMember)(interaction.member)) {
            // Check command
            return this.canKick(interaction.member);
        }
        else {
            return this.error({ message: `Error: You do not seem to be running this command from inside a discord server` });
        }
    }
    //Context menu command
    async contextMenuRun(interaction) {
        // Ensure they are a GuildMember, so we can check their command
        if ((0, discord_js_utilities_1.isGuildMember)(interaction.member)) {
            // Check command
            return this.canKick(interaction.member);
        }
        else {
            return this.error({ message: `Error: You do not seem to be running this command from inside a discord server` });
        }
    }
    /**
     * Check if a GuildMember has access to mute user's in their guild
     */
    async canKick(member) {
        return member.permissions.has(discord_js_1.Permissions.FLAGS.KICK_MEMBERS)
            ? this.ok()
            : this.error({ message: `You are missing the permission: \`KICK_MEMBERS\`` });
    }
}
exports.CanKick = CanKick;
