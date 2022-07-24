import {AbstractModerationAction} from "../../moderation/abstract/AbstractModerationAction";
import {PermCheckOptions} from "./interfaces/PermCheckOptions";
import {AdditionalCheckOptions} from "./interfaces/AdditionalCheckOptions";
import {CommandCheckError} from "../../errors/CommandCheckError";
import {CommandPermissionError} from "../../errors/CommandPermissionError";

export class CommandUtil
{
    static async performChecks(action: AbstractModerationAction, options: { permChecks?: PermCheckOptions, additionalChecks?: AdditionalCheckOptions }): Promise<null | CommandPermissionError | CommandCheckError>
    {
        return await this.checkPermissions(action, options.permChecks) || await this.performAdditionalChecks(action, options.additionalChecks);
    }

    /**
     * perform necessary and fundamental permission checks
     * @param action the moderation action that is going to be performed
     * @param options object containing which checks you want to be performed
     */
    public static async checkPermissions(action: AbstractModerationAction, options: PermCheckOptions): Promise<null | CommandPermissionError>
    {
        if (!options)
            return null;

        // If we should perform a check to ensure the issuing user has a certain permission node
        if (options.checkIssuerHasPerm)
        {
            // Fetch all the members in the guild
            const members = await action.guild.members.fetch();
            // Find the issuing member
            const issuingMember = members.find(member => member.id == action.issuer.id);
            // Check if they have the requisite permission node
            if (!issuingMember.permissions.has(options.checkIssuerHasPerm))
                return new CommandPermissionError({message: `**Error:** You are missing the permission node \`${options.checkIssuerHasPerm}\``})
        }

        // If we should perform a check to see if the targeted user has higher command than the client
        if (options.checkTargetIsBelowClient)
        {
            // Look up the client in the guild
            const me = action.guild.me;
            // Look up the target in the guild
            const targetMember = (await action.guild.members.fetch()).find(member => member.id === action.target.id);
            // If the target was not found then there is no issue with the target having higher command that the client
            if (!targetMember)
                return null;
            // Check if the target has higher command than the client
            if (targetMember.roles.highest.position >= me.roles.highest.position)
                return new CommandPermissionError({message: "**Error:** That member's roles are higher or equal to mine. I cannot perform that command on them!"});
        }

        // If we should perform a check to see if the target's command are higher than the issuer's command
        if (options.checkTargetIsBelowIssuer)
        {
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
                return new CommandPermissionError({message: "**Error:** That user's roles are higher or equal to yours. You cannot perform that command on them!"})
        }
    }

    /**
     * perform necessary and fundamental checks to ensure successful command execution
     * @param action the moderation action that is going to be performed
     * @param options object containing which checks to be performed
     */
    public static async performAdditionalChecks(action: AbstractModerationAction, options: AdditionalCheckOptions): Promise<null | CommandCheckError>
    {
        if (!options)
            return null;

        // If we should perform a check to ensure the targeted user is in this guild
        if (options.checkTargetIsInGuild)
        {
            // Fetch all the members in the guild
            const members = await action.guild.members.fetch();
            // Check that there exists a GuildMember whose id matches the target's id.
            const found: boolean = members.some(member => member.id === action.target.id);
            // If the member was not found
            if (!found)
                return new CommandCheckError({message: "**Error:** That user is not in this server!"});
        }

        // If we should perform a check to ensure the targeted user is muted
        if (options.checkTargetMuted)
        {
            const targetMember = (await action.guild.members.fetch()).find(member => member.id === action.target.id);
            // If the target was not found then there is no issue with the target not being muted
            if (!targetMember)
                return null;
            if (!targetMember.isCommunicationDisabled())
                return new CommandCheckError({message: "**Error**: user is not muted"})
        }

        // If we should perform a check to ensure the targeted user is not muted
        if (options.checkTargetNotMuted)
        {
            const targetMember = (await action.guild.members.fetch()).find(member => member.id === action.target.id);
            // If the target was not found then there is no issue with the target being muted
            if (!targetMember)
                return null;
            if (targetMember.isCommunicationDisabled())
                return new CommandCheckError({message: "**Error**: user is already muted"})
        }

        // If we should perform a check to ensure the targeted user is banned from this guild
        if (options.checkTargetBanned)
        {
            // Fetch all the guild's bans
            const bans = await action.guild.bans.fetch();
            // Check if this user is banned
            if (!bans.some(ban => ban.user.id === action.target.id))
                return new CommandCheckError({message: "**Error:** That user is not banned from this server"})
        }

        // If we should perform a check to ensure the targeted user is not banned from this guild
        if (options.checkTargetNotBanned)
        {
            // Fetch all the guild's bans
            const bans = await action.guild.bans.fetch();
            // Check if this user is banned
            if (bans.some(ban => ban.user.id === action.target.id))
                return new CommandCheckError({message: "**Error:** That user is already banned from this server"});
        }
    }
}