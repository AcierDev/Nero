import {PermissionString} from "discord.js";

export interface CommandCheckOptions
{
    checkTargetIsBelowClient?: boolean,
    checkTargetIsBelowIssuer?: boolean,
    checkIssuerHasPerm?: PermissionString,
    checkTargetIsInGuild?: boolean,
    checkTargetMuted?: boolean,
    checkTargetNotMuted?: boolean,
    checkTargetBanned?: boolean,
    checkTargetNotBanned?: boolean,
}