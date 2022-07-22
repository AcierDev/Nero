import {AllFlowsPrecondition} from "@sapphire/framework";
import {CommandInteraction, ContextMenuInteraction, GuildMember, Message, Permissions} from "discord.js";
import {isGuildMember} from '@sapphire/discord.js-utilities';

export class CanKick extends AllFlowsPrecondition
{
    // Chat command
    public override async messageRun(message: Message)
    {
        return this.canKick(message.member);
    }

    // Slash command
    public override async chatInputRun(interaction: CommandInteraction)
    {
        // Ensure they are a GuildMember, so we can check their permissions
        if (isGuildMember(interaction.member))
        {
            // Check permissions
            return this.canKick(interaction.member);
        } else
        {
            return this.error({message: `Error: You do not seem to be running this command from inside a discord server`})
        }
    }

    //Context menu command
    public override async contextMenuRun(interaction: ContextMenuInteraction)
    {
        // Ensure they are a GuildMember, so we can check their permissions
        if (isGuildMember(interaction.member))
        {
            // Check permissions
            return this.canKick(interaction.member);
        } else
        {
            return this.error({message: `Error: You do not seem to be running this command from inside a discord server`})
        }
    }

    /**
     * Check if a GuildMember has access to mute user's in their guild
     */
    private async canKick(member: GuildMember)
    {
        return member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)
            ? this.ok()
            : this.error({message: `You are missing the permission: \`KICK_MEMBERS\``})
    }
}

declare module '@sapphire/framework'
{
    interface Preconditions
    {
        CanKick: never;
    }
}