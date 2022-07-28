import {CommandError} from "../../errors/CommandError";
import {DbManager} from "../../db/DbManager";
import {DurationModerationAction} from "./DurationModerationAction";
import {Command} from "@sapphire/framework";
import {TimeUtil} from "../../util/TimeUtil";

export class Ban extends DurationModerationAction
{
    // -------------------------------------------- //
    // STATIC FACTORY
    // --------------------------------------------//

    /**
     * Create and return an object from an interaction
     * @param interaction
     */
    public static async interactionFactory(interaction: Command.ChatInputInteraction): Promise<Ban>
    {
        // get the command arguments
        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason', true);
        const durationString = interaction.options.getString('duration', false) ?? "";
        const silent = interaction.options.getBoolean('silent') ?? false;

        // Attempt to parse what the user entered for the duration into a number
        const duration = TimeUtil.generateDuration(durationString.split(" "));

        // if the user provided a duration, and the parse of that duration failed
        if (duration && !duration)
        {
            // Send error message
            await interaction.reply({
                content: `${durationString} could not be converted into a valid duration`,
                ephemeral: true
            });
            // Exit
            return;
        }


        // On successful parsing of the duration
        return new Ban(
            user,
            reason,
            interaction.user,
            Date.now(),
            interaction.guild,
            interaction.channel,
            silent,
            duration,
        );
    }

    // -------------------------------------------- //
    // METHODS
    // -------------------------------------------- //

    public override async run(): Promise<CommandError | null>
    {
        // -------------------------------------------- //
        // This method needs to be overriden because Bans need to be performed in a different order
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

        // Inform user
        const message = await this.informUser();

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

        // If message could not be sent to user
        if (!message)
            // Return an error
            return new CommandError({
                message: "error sending message to user. Command execution was successful",
                emoji: '<:errormessage:1000894890441453748>',
                additionalEmbedData: {
                    color: '#FFCC00'
                }
            })

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
            await this.guild.bans.create(this.target, {reason: this.reason, days: 1});
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