import {AbstractModerationAction} from "./AbstractModerationAction";
import {DurationBasedAction} from "./DurationBasedAction";
import {Guild, MessageEmbed, TextBasedChannel, User} from "discord.js";
import {Command} from "@sapphire/framework";
import {TimeUtil} from "../../util/TimeUtil";
import humanize from 'humanize-duration';
import {DbTypes} from "../../db/types/DbTypes";
import DurationModActionDbObj = DbTypes.DurationModActionDbObj;
import {CommandExecutionError} from "../../errors/CommandExecutionError";

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

    public override async execute(): Promise<CommandExecutionError | null>
    {
        // Record to db
        if (!await this.recordToDb())
            return new CommandExecutionError({message: "**CommandError:** Database operations error. Command was not executed"})
        // Inform user
        if (!await this.messageTarget())
            return new CommandExecutionError({
                message: "**CommandError:** There was an error informing the user about this moderation action. They have not received a private message." +
                    " However, the command executed successfully, and all database operations were successful. This action will show in their history"
            })
        // Execute action
        if (!await this.perform())
            return new CommandExecutionError({
                message: "**CommandError:** Database operations were successful and the command was recorded. There was an error in command execution." +
                    " Do not expect the command to have been executed. User was not informed of this moderation action"
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
    public async perform(): Promise<boolean>
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