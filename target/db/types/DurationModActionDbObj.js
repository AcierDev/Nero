"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DurationModActionDbObj = void 0;
const ModActionDbObj_1 = require("./ModActionDbObj");
class DurationModActionDbObj extends ModActionDbObj_1.ModActionDbObj {
    // -------------------------------------------- //
    // FIELDS
    // -------------------------------------------- //
    _duration;
    // -------------------------------------------- //
    // CONSTRUCTOR
    // -------------------------------------------- //
    constructor(name, reason, issuerId, targetId, guildId, channelId, silent, timestamp, duration) {
        super(name, reason, issuerId, targetId, guildId, channelId, silent, timestamp);
        this.duration = duration;
    }
    // -------------------------------------------- //
    // GETTERS AND SETTERS
    // -------------------------------------------- //
    get duration() {
        return this._duration;
    }
    set duration(value) {
        this._duration = value;
    }
    // -------------------------------------------- //
    // METHODS
    // -------------------------------------------- //
    /**
     * Get the duration remaining for this action
     */
    getDurationRemaining() {
        return Math.min(0, this.duration - (Date.now() - this.timestamp));
    }
}
exports.DurationModActionDbObj = DurationModActionDbObj;
