import {AllFlowsPrecondition} from "@sapphire/framework";
import {CommandInteraction, ContextMenuInteraction, GuildMember, Message, Permissions} from "discord.js";
import {isGuildMember} from "@sapphire/discord.js-utilities";

export class CanBan extends AllFlowsPrecondition
{
    // Chat command
    public override async messageRun(message: Message)
    {
        // Ensure they are a GuildMember, so we can check their command
        if (isGuildMember(message.member))
        {
            // Check their command
            return this.canBan(message.member);
        } else
        {
            return this.error({message: `Error: You cannot run this command outside a server`})
        }
    }

    // Slash command
    public override async chatInputRun(interaction: CommandInteraction)
    {
        // Ensure they are a GuildMember, so we can check their command
        if (isGuildMember(interaction.member))
        {
            // Check command
            return this.canBan(interaction.member);
        } else
        {
            return this.error({message: `Error: You cannot run this command outside a server`})
        }
    }

    //Context menu command
    public override async contextMenuRun(interaction: ContextMenuInteraction)
    {
        // Ensure they are a GuildMember, so we can check their command
        if (isGuildMember(interaction.member))
        {
            // Check command
            return this.canBan(interaction.member);
        } else
        {
            return this.error({message: `Error: You cannot run this command outside a server`})
        }
    }

    /**
     * Check if a GuildMember has access to ban users in their guild
     */
    private async canBan(member: GuildMember)
    {
        return member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)
            ? this.ok()
            : this.error({message: `You are missing the permission: \`BAN_MEMBERS\``})
    }
}

declare module '@sapphire/framework'
{
    interface Preconditions
    {
        CanBan: never;
    }
}