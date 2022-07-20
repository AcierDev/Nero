import {AbstractModerationAction} from "../abstract/AbstractModerationAction";
import {Guild, TextBasedChannel, User} from "discord.js";
import {Command} from "@sapphire/framework";

export class Kick extends AbstractModerationAction {
    // -------------------------------------------- //
    // STATIC FACTORIES
    // Static methods to return an instance of the class
    // because this shitty language doesn't have constructor overloading
    // --------------------------------------------//

    /**
     * Generate an instance of a kick from an interaction
     */
    public static async interactionFactory(interaction: Command.ChatInputInteraction)
    {

    }
}