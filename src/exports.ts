import {Ban} from "./moderation/actions/Ban";
import {Kick} from "./moderation/actions/Kick";
import {Mute} from "./moderation/actions/Mute";
import {Unban} from "./moderation/actions/Unban";
import {Unmute} from "./moderation/actions/Unmute";
import {Warning} from "./moderation/actions/Warning";

export const exportedClasses = {
    Ban: Ban,
    Kick: Kick,
    Mute: Mute,
    Unban: Unban,
    Unmute: Unmute,
    Warning: Warning,
}