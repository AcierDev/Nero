import {AbstractModerationAction} from "./AbstractModerationAction";
import {DurationBasedAction} from "./DurationBasedAction";
import {Guild, MessageEmbed, TextBasedChannel, User} from "discord.js";
import {Command} from "@sapphire/framework";
import {TimeUtil} from "../../util/TimeUtil";
import humanize from 'humanize-duration';
import {DbTypes} from "../../db/types/DbTypes";
import DurationModActionDbObj = DbTypes.DurationModActionDbObj;
import {CommandError} from "../../errors/CommandError";
import {DbManager} from "../../db/DbManager";

export class Ban extends AbstractModerationAction implements DurationBasedAction
{
    // -------------------------------------------- //
    // ADDITIONAL FIELDS
    // -------------------------------------------- //
    _duration: number;

    // -------------------------------------------- //
    // CONSTRUCTOR
    // -------------------------------------------- //
    constructor(target: User, reason: string, issuer: User, timestamp: number, guild: Guild, channel: TextBasedChannel, silent: boolean, duration: number)
    {
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
     * Generate a Ban object from an interaction
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
    // GETTERS AND SETTERS
    // -------------------------------------------- //
    get duration(): number
    {
        return this._duration;
    }

    set duration(value: number)
    {
        this._duration = value;
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
     * Generate a discord embed providing the details of this moderation action
     */
    public genEmbed(): MessageEmbed
    {
        return new MessageEmbed()
            .setTitle('You were banned!')
            .setColor('#FF3131')
            .setThumbnail(this.guild.iconURL())
            .setDescription(`${this.target} you have been **banned** from **${this.guild.name}** ${this._duration ? `for **${humanize(this._duration)}**` : ''}`)
            .addField(`Reason`, `\`\`\`${this.reason}\`\`\``)
            .setFooter({text: `${this.guild.name}`, iconURL: this.guild.iconURL()})
    }

    /**
     * Perform moderation actions in the guild
     */
    public async execute(): Promise<boolean>
    {
        try
        {
            // Try to find the target user in the guild
            const member = (await this.guild.members.fetch()).find(member => member.id == this.target.id);
            // If the member isn't found, indicate a failure. This should be an unreachable state
            if (!member)
                return false;
            // Attempt to time out the user via the api
            await member.ban({reason: this.reason, days: 1});
            // Indicate success
            return true;
        } catch (e)
        {
            console.log(e);
            // Indicate failure
            return false;
        }
    }

    /**
     * Get the duration remaining for this ban
     */
    public getDurationRemaining(): number
    {
        return Math.min(0, this.duration - (Date.now() - this.timestamp))
    }

    /**
     * Generate a db object
     */
    public toDbObj(): DurationModActionDbObj
    {
        return new DurationModActionDbObj(
            "Ban",
            this.reason,
            this.issuer.id,
            this.target.id,
            this.guild.id,
            this.channel.id,
            this.silent,
            this.timestamp,
            this.duration
        )
    }
}