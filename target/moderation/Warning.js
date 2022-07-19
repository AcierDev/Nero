"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Warning = void 0;
const AbstractModerationAction_1 = require("./abstract/AbstractModerationAction");
const discord_js_1 = require("discord.js");
class Warning extends AbstractModerationAction_1.AbstractModerationAction {
    genEmbed() {
        return new discord_js_1.MessageEmbed()
            .setTitle('You were warned!')
            .setColor('#FF3131')
            .setThumbnail(this.guild.iconURL({ format: 'png' }))
            .setDescription(`${this.target} you have received a **warning** from **${this.guild.name}**`)
            .addField(`Reason`, `\`\`\`${this.reason}\`\`\``)
            .setFooter({ text: `${this.guild.name} staff team`, iconURL: this.guild.iconURL() });
    }
    perform() {
        return Promise.resolve(true);
    }
    recordToDb() {
        //TODO
        return Promise.resolve(true);
    }
}
exports.Warning = Warning;
