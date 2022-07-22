import {AbstractModerationAction} from "../abstract/AbstractModerationAction";
import {Guild, MessageEmbed, TextBasedChannel, User} from "discord.js";
import humanize from 'humanize-duration';
import {DurationBasedAction} from "../interfaces/DurationBasedAction";
import {TimeUtil} from "../../util/TimeUtil";
import {Command} from "@sapphire/framework";
import {DbTypes} from "../../db/types/DbTypes";
import DurationModActionDbObj = DbTypes.DurationModActionDbObj;

export class Mute extends AbstractModerationAction implements DurationBasedAction
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
     * Generate a Mute instance from an interaction
     */
    public static async interactionFactory(interaction: Command.ChatInputInteraction): Promise<Mute>
    {
        // get the command arguments
        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason', true);
        const durationString = interaction.options.getString('duration', true) ?? "";
        const silent = interaction.options.getBoolean('silent') ?? false;

        // Attempt to parse what the user entered for the duration into a number
        const duration = TimeUtil.generateDuration(durationString.split(" "));

        // If the parse failed
        if (!duration)
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
        return new Mute(
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

    /**
     * Generate a discord embed providing the details of this moderation action
     */
    override genEmbed(): MessageEmbed
    {
        return new MessageEmbed()
            .setTitle('Your were muted!')
            .setColor('#FF3131')
            .setThumbnail(this.guild.iconURL())
            .setDescription(`${this.target} you have been **muted** from **${this.guild.name}** for **${humanize(this._duration)}**`)
            .addField(`Reason`, `\`\`\`${this.reason}\`\`\``)
            .setFooter({text: `${this.guild.name}`, iconURL: this.guild.iconURL()})
    }

    /**
     * Perform the mute in the guild
     */
    override async perform(): Promise<boolean>
    {
        try
        {
            // Try to find the target user in the guild
            const member = (await this.guild.members.fetch()).find(member => member.id == this.target.id);
            // If the member isn't found, indicate a failure. This should be an unreachable state
            if (!member)
                return false;
            // Attempt to time out the user via the api
            await member.timeout(this._duration, this.reason);
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
     * Get the duration remaining for this mute
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
            "Mute",
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