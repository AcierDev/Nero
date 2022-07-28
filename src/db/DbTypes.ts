import {NamedClass} from "../interfaces/NamedClass";
import {DurationBasedAction} from "../interfaces/DurationBasedAction";
import adler from 'adler-32';

export module DbTypes
{
    export class ModActionDbType implements NamedClass
    {

        // -------------------------------------------- //
        // FIELDS
        // -------------------------------------------- //
        _clazzName = "ModActionDbType";

        // mame of the moderation action
        private _type: string;
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
        // whether this action was deleted
        private _deleted: boolean;
        // unique id of this action
        private _id: string;


        // -------------------------------------------- //
        // CONSTRUCTOR
        // -------------------------------------------- //

        constructor(name: string, reason: string, issuerId: string, targetId: string, guildId: string, channelId: string, silent: boolean, timestamp: number, id: string)
        {
            this.type = name;
            this.reason = reason;
            this.issuerId = issuerId;
            this.targetId = targetId;
            this.guildId = guildId;
            this.channelId = channelId;
            this.silent = silent;
            this.timestamp = timestamp;
            this.deleted = false;
            this.id = id;
        }

        // -------------------------------------------- //
        // GETTERS AND SETTERS
        // -------------------------------------------- //
        get clazzName(): string
        {
            return this._clazzName;
        }

        get type(): string
        {
            return this._type;
        }

        set type(value: string)
        {
            this._type = value;
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

        get deleted(): boolean
        {
            return this._deleted;
        }

        set deleted(deleted: boolean)
        {
            this._deleted = deleted;
        }

        get id(): string
        {
            return this._id;
        }

        set id(id: string)
        {
            this._id = id;
        }
    }

    export class DurationActionDbType extends ModActionDbType implements DurationBasedAction, NamedClass
    {
        // -------------------------------------------- //
        // FIELDS
        // -------------------------------------------- //

        _duration: number;
        _clazzName = "DurationActionDbType";

        // -------------------------------------------- //
        // CONSTRUCTOR
        // -------------------------------------------- //

        constructor(name: string, reason: string, issuerId: string, targetId: string, guildId: string, channelId: string, silent: boolean, timestamp: number, duration: number, id: string)
        {
            super(name, reason, issuerId, targetId, guildId, channelId, silent, timestamp, id);
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
}