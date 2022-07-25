"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanBan = void 0;
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const discord_js_utilities_1 = require("@sapphire/discord.js-utilities");
class CanBan extends framework_1.AllFlowsPrecondition {
    // Chat command
    async messageRun(message) {
        // Ensure they are a GuildMember, so we can check their command
        if ((0, discord_js_utilities_1.isGuildMember)(message.member)) {
            // Check their command
            return this.canBan(message.member);
        }
        else {
            return this.error({ message: `Error: You cannot run this command outside a server` });
        }
    }
    // Slash command
    async chatInputRun(interaction) {
        // Ensure they are a GuildMember, so we can check their command
        if ((0, discord_js_utilities_1.isGuildMember)(interaction.member)) {
            // Check command
            return this.canBan(interaction.member);
        }
        else {
            return this.error({ message: `Error: You cannot run this command outside a server` });
        }
    }
    //Context menu command
    async contextMenuRun(interaction) {
        // Ensure they are a GuildMember, so we can check their command
        if ((0, discord_js_utilities_1.isGuildMember)(interaction.member)) {
            // Check command
            return this.canBan(interaction.member);
        }
        else {
            return this.error({ message: `Error: You cannot run this command outside a server` });
        }
    }
    /**
     * Check if a GuildMember has access to ban users in their guild
     */
    async canBan(member) {
        return member.permissions.has(discord_js_1.Permissions.FLAGS.BAN_MEMBERS)
            ? this.ok()
            : this.error({ message: `You are missing the permission: \`BAN_MEMBERS\`` });
    }
}
exports.CanBan = CanBan;
