import {MessageEmbed} from "discord.js";
import {SuccessEmbedOptions} from "./interfaces/SuccessEmbedOptions";
import {FailureEmbedOptions} from "./interfaces/FailureEmbedOptions";

export class EmbedGenerator
{
    public static successEmbed(options: SuccessEmbedOptions): MessageEmbed
    {
        return new MessageEmbed()
            .setDescription(options.emojiResolvable + ' ' + options.message)
            .setColor('#03FBAB');
    }

    public static failureEmbed(options: FailureEmbedOptions): MessageEmbed
    {
        return new MessageEmbed()
            .setDescription(options.emojiResolvable + ' ' + options.message)
            .setColor(options.colorResolvable)
    }
}