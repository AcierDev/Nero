import {ColorResolvable, EmojiResolvable} from "discord.js";

export abstract class CommandError
{
    // -------------------------------------------- //
    // FIELDS
    // -------------------------------------------- //
    private _message: string;
    private _emoji: EmojiResolvable;
    private _color: ColorResolvable;

    // -------------------------------------------- //
    // CONSTRUCTOR
    // -------------------------------------------- //
    constructor(options: { message: string, emoji: EmojiResolvable, color: ColorResolvable })
    {
        this.message = options.message;
        this.emoji = options.emoji;
        this.color = options.color;
    }

    // -------------------------------------------- //
    // GETTERS AND SETTERS
    // -------------------------------------------- //
    get message(): string
    {
        return this._message;
    }

    set message(message)
    {
        this._message = message;
    }

    get emoji(): EmojiResolvable
    {
        return this._emoji;
    }

    set emoji(value: EmojiResolvable)
    {
        this._emoji = value;
    }

    get color(): ColorResolvable
    {
        return this._color;
    }

    set color(value: ColorResolvable)
    {
        this._color = value;
    }
}