"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModActionDbObj = void 0;
class ModActionDbObj {
    // -------------------------------------------- //
    // FIELDS
    // -------------------------------------------- //
    // mame of the moderation action
    _name;
    // reason provided for this moderation action
    _reason;
    // id of the user who issued this moderation action
    _issuerId;
    // id of the user who was the target of this moderation action
    _targetId;
    // id of the guild this action was issued in
    _guildId;
    // id of the channel this action was issued in
    _channelId;
    // whether this action was silent
    _silent;
    // timestamp of the moderation action
    _timestamp;
    // -------------------------------------------- //
    // CONSTRUCTOR
    // -------------------------------------------- //
    constructor(name, reason, issuerId, targetId, guildId, channelId, silent, timestamp) {
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
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    get reason() {
        return this._reason;
    }
    set reason(value) {
        this._reason = value;
    }
    get issuerId() {
        return this._issuerId;
    }
    set issuerId(value) {
        this._issuerId = value;
    }
    get targetId() {
        return this._targetId;
    }
    set targetId(value) {
        this._targetId = value;
    }
    get guildId() {
        return this._guildId;
    }
    set guildId(value) {
        this._guildId = value;
    }
    get channelId() {
        return this._channelId;
    }
    set channelId(value) {
        this._channelId = value;
    }
    get silent() {
        return this._silent;
    }
    set silent(value) {
        this._silent = value;
    }
    get timestamp() {
        return this._timestamp;
    }
    set timestamp(value) {
        this._timestamp = value;
    }
}
exports.ModActionDbObj = ModActionDbObj;
