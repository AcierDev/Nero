import {ModerationAction} from "./ModerationAction";
import {DurationBasedAction} from "../../interfaces/DurationBasedAction";
import {Guild, TextBasedChannel, User} from "discord.js";
import {Command} from "@sapphire/framework";
import {TimeUtil} from "../../util/TimeUtil";
import {DbTypes} from "../../db/DbTypes";
import DurationModActionDbObj = DbTypes.DurationActionDbType;
import DurationActionDbType = DbTypes.DurationActionDbType;
import {ClientWrapper} from "../../ClientWrapper";
import humanize from 'humanize-duration';

export class DurationModerationAction extends ModerationAction implements DurationBasedAction
{
    // -------------------------------------------- //
    // STATIC FACTORY
    // --------------------------------------------//

    /**
     * Create and return an object from an interaction
     * @param interaction
     */
    public static async interactionFactory(interaction: Command.ChatInputInteraction): Promise<DurationModerationAction>
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
        return new DurationModerationAction(
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

    /**
     * Create and return an object from a db document
     * @param document
     */
    public static async dbFactory(document: DurationActionDbType): Promise<DurationModerationAction>
    {
        try
        {
            // Fetch fields and return a new object
            return new DurationModerationAction(
                await ClientWrapper.get().users.fetch(document.targetId),
                document.reason,
                await ClientWrapper.get().users.fetch(document.issuerId),
                document.timestamp,
                await ClientWrapper.get().guilds.fetch(document.guildId),
                await ClientWrapper.get().channels.fetch(document.channelId) as TextBasedChannel,
                document.silent,
                document.duration
            )
        } catch (e)
        {
            // Stack trace
            console.log(e)
            return null;
        }
    }

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
        super(target, reason, issuer, timestamp, guild, channel, silent, {});

        this.duration = duration;
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

    public getDurationRemaining(): number
    {
        return Math.min(0, this.duration - (Date.now() - this.timestamp))
    }

    // -------------------------------------------- //
    // METHODS
    // -------------------------------------------- //

    override toDbObj(): DurationModActionDbObj
    {
        return new DurationModActionDbObj(
            this.constructor.name,
            this.reason,
            this.issuer.id,
            this.target.id,
            this.guild.id,
            this.channel.id,
            this.silent,
            this.timestamp,
            this.duration,
            this.id
        )
    }

    public toString(): string
    {
        return `User: ${this.target}` +
            + `\n Moderator: ${this.issuer}`
            + `\n Reason: ${this.reason}`
            + `\n Duration: ${humanize(this.duration)}`
            + `\n Date: <t:${Math.trunc(this.timestamp / 1000)}:F>`
            + `\n Id: ${this.id}`
    }
}