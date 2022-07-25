"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionUtil = void 0;
const PermissionError_1 = require("../errors/PermissionError");
class PermissionUtil {
    /**0
     * perform necessary and fundamental permission checks
     * @param action the moderation action that is going to be performed
     * @param options object containing the command you want to be checked
     */
    static async checkPermissions(action, options) {
        // If we should perform a check to ensure the issuing user has a certain permission node
        if (options.checkIssuerHasPerm) {
            // Fetch all the members in the guild
            const members = await action.guild.members.fetch();
            // Find the issuing member
            const issuingMember = members.find(member => member.id == action.issuer.id);
            // Check if they have the requisite permission node
            if (!issuingMember.permissions.has(options.checkIssuerHasPerm))
                return new PermissionError_1.PermissionError({ message: `**Error:** You are missing the permission node \`${options.checkIssuerHasPerm}\`` });
        }
        // If we should perform a check to ensure the targeted user is in this guild
        if (options.ensureTargetIsInGuild) {
            // Fetch all the members in the guild
            const members = await action.guild.members.fetch();
            // Check that there exists a GuildMember whose id matches the target's id.
            const found = members.some(member => member.id === action.target.id);
            // If the member was not found
            if (!found)
                return new PermissionError_1.PermissionError({ message: "**ErrorInterfaces:** That user is not in this server!" });
        }
        // If we should perform a check to see if the targeted user has higher command than the client
        if (options.checkTargetIsBelowClient) {
            // Look up the client in the guild
            const me = action.guild.me;
            // Look up the target in the guild
            const targetMember = (await action.guild.members.fetch()).find(member => member.id === action.target.id);
            // If the target was not found then there is no issue with the target having higher command that the client
            if (!targetMember)
                return null;
            // Check if the target has higher command than the client
            if (targetMember.roles.highest.position >= me.roles.highest.position)
                return new PermissionError_1.PermissionError({ message: "**ErrorInterfaces:** That member's roles are higher or equal to mine. I cannot perform that command on them!" });
        }
        // If we should perform a check to see if the target's command are higher than the issuer's command
        if (options.checkTargetIsBelowIssuer) {
            // Fetch all the members in the guild
            const members = await action.guild.members.fetch();
            // Look up the issuer in the guild
            const issuingMember = members.find(member => member.id === action.issuer.id);
            // Look up the target in the guild
            const targetMember = members.find(member => member.id === action.target.id);
            // If the target was not found then there is no issue with the target's command being above the issuer's command
            if (!targetMember)
                return null;
            // Check if the target has higher command than the issuer
            if (targetMember.roles.highest.position >= issuingMember.roles.highest.position)
                return new PermissionError_1.PermissionError({ message: "**ErrorInterfaces:** That user's roles are higher or equal to yours. You cannot perform that command on them!" });
        }
    }
}
exports.PermissionUtil = PermissionUtil;
