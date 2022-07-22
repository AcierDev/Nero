"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Warning = void 0;
const AbstractModerationAction_1 = require("../abstract/AbstractModerationAction");
const discord_js_1 = require("discord.js");
const ModActionDbObj_1 = require("../../db/types/ModActionDbObj");
class Warning extends AbstractModerationAction_1.AbstractModerationAction {
    // -------------------------------------------- //
    // STATIC FACTORIES
    // Static methods to return an instance of the class
    // because this shitty language doesn't have constructor overloading
    // -------------------------------------------- //
    /**
     * Generate an instance of a Warning from an interaction
     */
    static async interactionFactory(interaction) {
        // get the command arguments
        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason', true);
        const silent = interaction.options.getBoolean('silent') ?? false;
        return new Warning(user, reason, interaction.user, Date.now(), interaction.guild, interaction.channel, silent);
    }
    // -------------------------------------------- //
    // OVERRIDES
    // -------------------------------------------- //
    genEmbed() {
        return new discord_js_1.MessageEmbed()
            .setTitle('You were warned!')
            .setColor('#FF3131')
            .setThumbnail(this.guild.iconURL({ format: 'png' }))
            .setDescription(`${this.target} you have received a **warning** from **${this.guild.name}**`)
            .addField(`Reason`, `\`\`\`${this.reason}\`\`\``)
            .setFooter({ text: `${this.guild.name}`, iconURL: this.guild.iconURL() });
        //TODO include guild invite link
    }
    async perform() {
        return Promise.resolve(true);
    }
    /**
     * Generate a db object
     */
    toDbObj() {
        return new ModActionDbObj_1.ModActionDbObj("Warning", this.reason, this.issuer.id, this.target.id, this.guild.id, this.channel.id, this.silent, this.timestamp);
    }
}
exports.Warning = Warning;
