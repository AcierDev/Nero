import {ColorResolvable, EmojiResolvable} from "discord.js";

export interface FailureEmbedOptions
{
    message: string,
    colorResolvable: ColorResolvable,
    emojiResolvable: EmojiResolvable,
}