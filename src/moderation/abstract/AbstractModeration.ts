import {MessageEmbed} from "discord.js";

export abstract class AbstractModeration {
    // User id of the user being moderated
    private _targetId: String;
    // Reason provided for this moderation action
    private _reason: String;
    // User id of the user issuing this moderation action
    private _issuerId: String;
    // Timestamp of the moderation action
    private _timestamp: number;
    // Guild id of the server this action was issued in
    private _guildId: String;
    // Channel id that this action was issued in
    private _channelId: String;
    // Whether to display the moderation action in chat
    private _silent: Boolean;

    get targetId(): String {
        return this._targetId;
    }

    set targetId(value: String) {
        this._targetId = value;
    }

    get reason(): String {
        return this._reason;
    }

    set reason(value: String) {
        this._reason = value;
    }

    get issuerId(): String {
        return this._issuerId;
    }

    set issuerId(value: String) {
        this._issuerId = value;
    }

    get timestamp(): number {
        return this._timestamp;
    }

    set timestamp(value: number) {
        this._timestamp = value;
    }

    get guildId(): String {
        return this._guildId;
    }

    set guildId(value: String) {
        this._guildId = value;
    }

    get channelId(): String {
        return this._channelId;
    }

    set channelId(value: String) {
        this._channelId = value;
    }

    get silent(): Boolean {
        return this._silent;
    }

    set silent(value: Boolean) {
        this._silent = value;
    }

    
    abstract genEmbed(): MessageEmbed;
}