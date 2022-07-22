"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mute = void 0;
const AbstractModerationAction_1 = require("../abstract/AbstractModerationAction");
const discord_js_1 = require("discord.js");
const humanize_duration_1 = __importDefault(require("humanize-duration"));
const TimeUtil_1 = require("../../util/TimeUtil");
const DurationModActionDbObj_1 = require("../../db/types/DurationModActionDbObj");
class Mute extends AbstractModerationAction_1.AbstractModerationAction {
    // -------------------------------------------- //
    // ADDITIONAL FIELDS
    // -------------------------------------------- //
    _duration;
    // -------------------------------------------- //
    // CONSTRUCTOR
    // -------------------------------------------- //
    constructor(target, reason, issuer, timestamp, guild, channel, silent, duration) {
        // Pass to super
        super(target, reason, issuer, timestamp, guild, channel, silent);
        this.duration = duration;
    }
    // -------------------------------------------- //
    // STATIC FACTORIES
    // Static methods to return an instance of the class
    // because this shitty language doesn't have constructor overloading
    // --------------------------------------------//
    /**
     * Generate a Mute instance from an interaction
     */
    static async interactionFactory(interaction) {
        // get the command arguments
        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason', true);
        const durationString = interaction.options.getString('duration', true);
        const silent = interaction.options.getBoolean('silent') ?? false;
        // Attempt to parse what the user entered for the duration into a number
        const duration = TimeUtil_1.TimeUtil.generateDuration(durationString.split(" "));
        // If the parse failed
        if (!duration) {
            // Send error message
            await interaction.reply({
                content: `${durationString} could not be converted into a valid duration`,
                ephemeral: true
            });
            // Exit
            return;
        }
        // On successful parsing of the duration
        return new Mute(user, reason, interaction.user, Date.now(), interaction.guild, interaction.channel, silent, duration);
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
     * Generate a discord embed providing the details of this moderation action
     */
    genEmbed() {
        return new discord_js_1.MessageEmbed()
            .setTitle('Your were muted!')
            .setColor('#FF3131')
            .setThumbnail(this.guild.iconURL())
            .setDescription(`${this.target} you have been **muted** from **${this.guild.name}** for **${(0, humanize_duration_1.default)(this._duration)}**`)
            .addField(`Reason`, `\`\`\`${this.reason}\`\`\``)
            .setFooter({ text: `${this.guild.name}`, iconURL: this.guild.iconURL() });
    }
    /**
     * Perform the mute in the guild
     */
    async perform() {
        try {
            // Try to find the target user in the guild
            const member = (await this.guild.members.fetch()).find(member => member.id == this.target.id);
            // If the member isn't found, indicate a failure. This should be an unreachable state
            if (!member)
                return false;
            // Attempt to time out the user via the api
            await member.timeout(this._duration, this.reason);
            // Indicate success
            return true;
        }
        catch (e) {
            console.log(e);
            // Indicate failure
            return false;
        }
    }
    /**
     * Get the duration remaining for this mute
     */
    getDurationRemaining() {
        return Math.min(0, this.duration - (Date.now() - this.timestamp));
    }
    /**
     * Generate a db object
     */
    toDbObj() {
        return new DurationModActionDbObj_1.DurationModActionDbObj("Mute", this.reason, this.issuer.id, this.target.id, this.guild.id, this.channel.id, this.silent, this.timestamp, this.duration);
    }
}
exports.Mute = Mute;
