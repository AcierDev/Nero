import {GuildMember, PermissionString} from "discord.js";
import {CommandError} from "../errors/CommandError";

export async function checkMemberHasPerm(member: GuildMember, perm: PermissionString): Promise<CommandError | void> {
    if (!member.permissions.has(perm)) {
    return new CommandError({
        message: `You are missing the permission \`${perm}\``,
        emoji: '<:denied:1000899042852737144>',
        additionalEmbedData: {
            color: '#FF0000'
        }
    })
}
}