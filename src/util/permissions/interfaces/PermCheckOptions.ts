import {PermissionString} from "discord.js";

export interface PermCheckOptions
{
    checkTargetIsBelowClient?: boolean,
    checkTargetIsBelowIssuer?: boolean,
    ensureTargetIsInGuild?: boolean,
    checkIssuerHasPerm?: PermissionString
}