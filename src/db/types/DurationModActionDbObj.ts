import {ModActionDbObj} from "./ModActionDbObj";
import {DurationBasedAction} from "../../moderation/interfaces/DurationBasedAction";

export class DurationModActionDbObj extends ModActionDbObj implements DurationBasedAction
{
    // -------------------------------------------- //
    // FIELDS
    // -------------------------------------------- //

     _duration: number;

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