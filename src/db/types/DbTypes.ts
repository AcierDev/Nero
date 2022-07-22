import {NamedClass} from "../../moderation/interfaces/NamedClass";
import {DurationBasedAction} from "../../moderation/interfaces/DurationBasedAction";

export module DbTypes
{
    export class ModActionDbObj implements NamedClass
    {

        // -------------------------------------------- //
        // FIELDS
        // -------------------------------------------- //
        _clazzName = "ModActionDbObj";

        // mame of the moderation action
        private _name: string;
        // reason provided for this moderation action
        private _reason: string;
        // id of the user who issued this moderation action
        private _issuerId: string
        // id of the user who was the target of this moderation action
        private _targetId: string;
        // id of the guild this action was issued in
        private _guildId: string;
        // id of the channel this action was issued in
        private _channelId: string;
        // whether this action was silent
        private _silent: boolean;
        // timestamp of the moderation action
        private _timestamp: number;

        // -------------------------------------------- //
        // CONSTRUCTOR
        // -------------------------------------------- //

        constructor(name: string, reason: string, issuerId: string, targetId: string, guildId: string, channelId: string, silent: boolean, timestamp: number)
        {
            this.name = name;
            this.reason = reason;
            this.issuerId = issuerId;
            this.targetId = targetId;
            this.guildId = guildId;
            this.channelId = channelId;
            this.silent = silent;
            this.timestamp = timestamp;
        }

        // -------------------------------------------- //
        // GETTERS AND SETTERS
        // -------------------------------------------- //
        get clazzName(): string
        {
            return this._clazzName;
        }
        get name(): string
        {
            return this._name;
        }

        set name(value: string)
        {
            this._name = value;
        }

        get reason(): string
        {
            return this._reason;
        }

        set reason(value: string)
        {
            this._reason = value;
        }

        get issuerId(): string
        {
            return this._issuerId;
        }

        set issuerId(value: string)
        {
            this._issuerId = value;
        }

        get targetId(): string
        {
            return this._targetId;
        }

        set targetId(value: string)
        {
            this._targetId = value;
        }

        get guildId(): string
        {
            return this._guildId;
        }

        set guildId(value: string)
        {
            this._guildId = value;
        }

        get channelId(): string
        {
            return this._channelId;
        }

        set channelId(value: string)
        {
            this._channelId = value;
        }

        get silent(): boolean
        {
            return this._silent;
        }

        set silent(value: boolean)
        {
            this._silent = value;
        }
        get timestamp(): number
        {
            return this._timestamp;
        }

        set timestamp(value: number)
        {
            this._timestamp = value;
        }
    }

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
}