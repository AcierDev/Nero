import {PermissionString} from "discord.js";

export interface PermCheckOptions
{
    checkTargetIsBelowClient?: boolean,
    checkTargetIsBelowIssuer?: boolean,
    checkIssuerHasPerm?: PermissionString
}