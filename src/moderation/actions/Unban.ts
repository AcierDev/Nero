import {ModerationAction} from "./ModerationAction";
import {Message, MessageEmbed} from "discord.js";
import {CommandError} from "../../errors/CommandError";
import {DbTypes} from "../../db/DbTypes";
import ModActionDbObj = DbTypes.ModActionDbType;
import {DbManager} from "../../db/DbManager";
import {Command} from "@sapphire/framework";

export class Unban extends ModerationAction
{
    // -------------------------------------------- //
    // STATIC FACTORIES
    // -------------------------------------------- //
    public static async interactionFactory(interaction: Command.ChatInputInteraction): Promise<Unban>
    {
        // get the command arguments
        const target = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason', true);
        const silent = interaction.options.getBoolean('silent', false) ?? false;

        // Create and return a new object
        return new Unban(
            target,
            reason,
            interaction.user,
            Date.now(),
            interaction.guild,
            interaction.channel,
            silent,
            {}
        );
    }

    // -------------------------------------------- //
    // METHODS
    // -------------------------------------------- //
    override async run(): Promise<CommandError | null>
    {
        // -------------------------------------------- //
        // THIS METHOD MUST BE OVERRIDEN BECAUSE WE CANNOT INFORM A USER ABOUT AN UNBAN
        // -------------------------------------------- //

        // Record this action to db
        const document = this.recordToDb();
        // If document insertion into the db was not successful
        if (!document)
            // Return an error
            return new CommandError({
                message: "Database error ",
                emoji: '<:database:1000894887429943327>',
                additionalEmbedData: {
                    color: '#FFCC00',
                }
            })

        // Attempt to execute the moderation action in the guild
        const success = await this.execute();
        // If command was not executed successfully
        if (!success)
        {
            // Remove the action from the db
            await DbManager.deleteAction(document)

            // Return an error
            return new CommandError({
                message: 'Command did not execute correctly',
                emoji: '<:cancel1:1001219492573089872>',
                additionalEmbedData: {
                    color: '#FFCC00',
                }
            })
        }

        // Indicate success
        return null;
    }

    /**
     * Perform moderation actions in the guild
     */
    public async execute(): Promise<boolean>
    {
        try
        {
            // Attempt to ban via the guild
            await this.guild.bans.remove(this.target, this.reason);
            // Indicate success
            return true;
        } catch (e)
        {
            console.log(e);
            // Indicate failure
            return false;
        }
    }
}