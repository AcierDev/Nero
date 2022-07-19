"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractModerationAction = void 0;
class AbstractModerationAction {
    // -------------------------------------------- //
    // FIELDS
    // -------------------------------------------- //
    // user being moderated
    _target;
    // Reason provided for this moderation action
    _reason;
    // user issuing this moderation action
    _issuer;
    // Timestamp of the moderation action
    _timestamp;
    // Guild this action was issued in
    _guild;
    // Channel id that this action was issued in
    _channel;
    // Whether to display the moderation action in chat
    _silent;
    // -------------------------------------------- //
    // CONSTRUCTORS
    // -------------------------------------------- //
    // Default constructor
    constructor(target, reason, issuer, timestamp, guild, channel, silent) {
        this._target = target;
        this._reason = reason;
        this._issuer = issuer;
        this._timestamp = timestamp;
        this._guild = guild;
        this._channel = channel;
        this._silent = silent;
    }
    //Constructor for id's instead of actual objects
    //TODO
    get target() {
        return this._target;
    }
    set target(value) {
        this._target = value;
    }
    get reason() {
        return this._reason;
    }
    set reason(value) {
        this._reason = value;
    }
    get issuer() {
        return this._issuer;
    }
    set issuer(value) {
        this._issuer = value;
    }
    get timestamp() {
        return this._timestamp;
    }
    set timestamp(value) {
        this._timestamp = value;
    }
    get guild() {
        return this._guild;
    }
    set guild(value) {
        this._guild = value;
    }
    get channel() {
        return this._channel;
    }
    set channel(value) {
        this._channel = value;
    }
    get silent() {
        return this._silent;
    }
    set silent(value) {
        this._silent = value;
    }
    /**
     * Execute the moderation action
     */
    async run() {
        return await this.recordToDb() && await this.sendActionToPlayer() && this.perform();
    }
    /**
     * Inform the target user about this moderation action
     */
    async sendActionToPlayer() {
        try {
            // Use the abstract method to generate an embed for this moderation action and send the embed to the target of the moderation action.
            // This might fail because there are situations where the bot cannot message the user
            await this.target.send({ embeds: [this.genEmbed()] });
            // Indicate the message was sent
            return true;
        }
        catch (e) {
            //Stack trace
            console.log(e);
            //Indicate the message was not sent
            return false;
        }
    }
}
exports.AbstractModerationAction = AbstractModerationAction;
