import {AllFlowsPrecondition} from "@sapphire/framework";
import {CommandInteraction, ContextMenuInteraction, GuildMember, Message, Permissions} from "discord.js";
import {isGuildMember} from '@sapphire/discord.js-utilities';

export class CanMute extends AllFlowsPrecondition
{
    // Chat command
    public override async messageRun(message: Message)
    {
        // Ensure they are a GuildMember, so we can check their permissions
        if (isGuildMember(message.member))
        {
            // Check their permissions
            return this.canMute(message.member);
        } else
        {
            return this.error({message: `Error: You cannot run this command outside a server`})
        }
    }

    // Slash command
    public override async chatInputRun(interaction: CommandInteraction)
    {
        // Ensure they are a GuildMember, so we can check their permissions
        if (isGuildMember(interaction.member))
        {
            // Check permissions
            return this.canMute(interaction.member);
        } else
        {
            return this.error({message: `Error: You cannot run this command outside a server`})
        }
    }

    //Context menu command
    public override async contextMenuRun(interaction: ContextMenuInteraction)
    {
        // Ensure they are a GuildMember, so we can check their permissions
        if (isGuildMember(interaction.member))
        {
            // Check permissions
            return this.canMute(interaction.member);
        } else
        {
            return this.error({message: `Error: You cannot run this command outside a server`})
        }
    }

    /**
     * Check if a GuildMember has access to mute users in their guild
     */
    private async canMute(member: GuildMember)
    {
        return member.permissions.has(Permissions.FLAGS.MUTE_MEMBERS)
            ? this.ok()
            : this.error({message: `You are missing the permission: \`MUTE_MEMBERS\``})
    }
}

declare module '@sapphire/framework'
{
    interface Preconditions
    {
        CanMute: never;
    }
}