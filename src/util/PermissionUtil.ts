import {AbstractModerationAction} from "../moderation/abstract/AbstractModerationAction";
import {PermissionError} from "../errors/PermissionError";
import {PermissionString} from "discord.js";

export class PermissionUtil
{
    /**0
     * perform necessary and fundamental permission checks
     * @param action the moderation action that is going to be performed
     * @param options object containing the permissions you want to be checked
     */
    public static async checkPermissions(action: AbstractModerationAction, options: {
        checkTargetIsBelowClient?: boolean,
        checkTargetIsBelowIssuer?: boolean,
        ensureTargetIsInGuild?: boolean,
        checkIssuerHasPerm?: PermissionString
    }): Promise<null | PermissionError>
    {
        // If we should perform a check to ensure the issuing user has a certain permission node
        if (options.checkIssuerHasPerm)
        {
            // Fetch all the members in the guild
            const members = await action.guild.members.fetch();
            // Find the issuing member
            const issuingMember = members.find(member => member.id == action.issuer.id);
            // Check if they have the requisite permission node
            if (!issuingMember.permissions.has(options.checkIssuerHasPerm))
                return new PermissionError({message: `**Error:** You are missing the permission node \`${options.checkIssuerHasPerm}\``})
        }

        // If we should perform a check to ensure the targeted user is in this guild
        if (options.ensureTargetIsInGuild)
        {
            // Fetch all the members in the guild
            const members = await action.guild.members.fetch();
            // Check that there exists a GuildMember whose id matches the target's id.
            const found: boolean = members.some(member => member.id === action.target.id);
            // If the member was not found
            if (!found)
                return new PermissionError({message: "**Error:** That user is not in this server!"});
        }

        // If we should perform a check to see if the targeted user has higher permissions than the client
        if (options.checkTargetIsBelowClient)
        {
            // Look up the client in the guild
            const me = action.guild.me;
            // Look up the target in the guild
            const targetMember = (await action.guild.members.fetch()).find(member => member.id === action.target.id);
            // If the target was not found then there is no issue with the target having higher permissions that the client
            if (!targetMember)
                return null;
            // Check if the target has higher permissions than the client
            if (targetMember.roles.highest.position >= me.roles.highest.position)
                return new PermissionError({message: "**Error:** That member's roles are higher or equal to mine. I cannot perform that command on them!"});
        }

        // If we should perform a check to see if the target's permissions are higher than the issuer's permissions
        if (options.checkTargetIsBelowIssuer)
        {
            // Fetch all the members in the guild
            const members = await action.guild.members.fetch();
            // Look up the issuer in the guild
            const issuingMember = members.find(member => member.id === action.issuer.id);
            // Look up the target in the guild
            const targetMember = members.find(member => member.id === action.target.id);
            // If the target was not found then there is no issue with the target's permissions being above the issuer's permissions
            if (!targetMember)
                return null;
            // Check if the target has higher permissions than the issuer
            if (targetMember.roles.highest.position >= issuingMember.roles.highest.position)
                return new PermissionError({message: "**Error:** That user's roles are higher or equal to yours. You cannot perform that command on them!"})
        }
    }
}