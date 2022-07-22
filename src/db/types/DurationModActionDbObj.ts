import {ModActionDbObj} from "./ModActionDbObj";
import {DurationBasedAction} from "../../moderation/interfaces/DurationBasedAction";
import {NamedClass} from "../../moderation/interfaces/NamedClass";

export class DurationModActionDbObj extends ModActionDbObj implements DurationBasedAction, NamedClass
{
    // -------------------------------------------- //
    // FIELDS
    // -------------------------------------------- //

     _duration: number;
     _clazzName = "DurationModActionDbObj";

    // -------------------------------------------- //
    // CONSTRUCTOR
    // -------------------------------------------- //

    constructor(name: string, reason: string, issuerId: string, targetId: string, guildId: string, channelId: string, silent: boolean, timestamp: number, duration: number)
    {
        super(name, reason, issuerId, targetId, guildId, channelId, silent, timestamp);
        this.duration = duration;
    }

    // -------------------------------------------- //
    // GETTERS AND SETTERS
    // -------------------------------------------- //

    get duration(): number
    {
        return this._duration;
    }
    set duration(value: number)
    {
        this._duration = value;
    }
    get clazzName(): string
    {
        return this._clazzName;
    }

    // -------------------------------------------- //
    // METHODS
    // -------------------------------------------- //

    /**
     * Get the duration remaining for this action
     */
    public getDurationRemaining(): number
    {
        return Math.min(0, this.duration - (Date.now() - this.timestamp))
    }
}