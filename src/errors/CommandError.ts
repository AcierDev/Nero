import {EmojiResolvable, MessageEmbed, MessageEmbedOptions} from "discord.js";

export class CommandError
{
    // -------------------------------------------- //
    // FIELDS
    // -------------------------------------------- //
    private _message: string;
    private _emoji: EmojiResolvable;
    private _embedData: MessageEmbedOptions;

    // -------------------------------------------- //
    // CONSTRUCTOR
    // -------------------------------------------- //
    constructor(options: { message: string, emoji: string, additionalEmbedData?: MessageEmbedOptions })
    {
        this.message = options.message;
        this.emoji = options.emoji;
        this.embedData = options.additionalEmbedData;
    }

    // -------------------------------------------- //
    // GETTERS AND SETTERS
    // -------------------------------------------- //

    public get message(): string
    {
        return this._message;
    }

    public set message(message: string)
    {
        this._message = message;
    }

    get embedData(): MessageEmbedOptions
    {
        return this._embedData;
    }

    set embedData(value: MessageEmbedOptions)
    {
        this._embedData = value;
    }

    get emoji(): EmojiResolvable
    {
        return this._emoji;
    }

    set emoji(value: EmojiResolvable)
    {
        this._emoji = value;
    }

    // -------------------------------------------- //
    // METHODS
    // -------------------------------------------- //
    public toMessageEmbed(): MessageEmbed
    {
        // Create an embed and set the required fields
        let embed = new MessageEmbed()
            .setDescription(this.emoji + " " + this.message)

        // Set any other optional fields that were passed to the constructor
        for (const field in this.embedData)
            embed[field] = this.embedData[field];
        console.log(embed)

        return embed;
    }
}