import {PermissionString, RoleResolvable} from "discord.js";

export interface CommandCheckOptions
{
    checkIssuerHasPerm?: PermissionString;
    checkIssuerHasRole: string;
    checkTargetIsBelowClient?: boolean;
    checkTargetIsBelowIssuer?: boolean;
    checkTargetIsInGuild?: boolean;
    checkTargetMuted?: boolean;
    checkTargetNotMuted?: boolean;
    checkTargetBanned?: boolean;
    checkTargetNotBanned?: boolean;
}