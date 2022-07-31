import {ModerationAction} from "../types/ModerationAction";
import {Guild, MessageEmbed, TextBasedChannel, User} from "discord.js";
import humanize from 'humanize-duration';
import {DurationBasedAction} from "../../interfaces/DurationBasedAction";
import {TimeUtil} from "../../util/TimeUtil";
import {Command} from "@sapphire/framework";
import {DbTypes} from "../../db/DbTypes";
import DurationModActionDbObj = DbTypes.DurationActionDbType;
import {DurationModerationAction} from "../types/DurationModerationAction";

export class Mute extends DurationModerationAction
{
    // -------------------------------------------- //
    // STATIC FACTORY
    // --------------------------------------------//

    /**
     * Create and return an object from an interaction
     * @param interaction
     */
    public static async interactionFactory(interaction: Command.ChatInputInteraction): Promise<Mute>
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
        return new Mute(
            user,
            reason,
            interaction.user,
            Date.now(),
            interaction.guild,
            interaction.channel,
            silent,
            duration,
            {}
        );
    }

    // -------------------------------------------- //
    // METHODS
    // -------------------------------------------- //

    /**
     * Generate a discord embed providing the details of this moderation action
     */
    override toMessageEmbed(): MessageEmbed
    {
        return new MessageEmbed()
            .setTitle('Your were muted')
            .setColor('#FF3131')
            .setThumbnail(this.guild.iconURL())
            .setDescription(`${this.target} you have been **muted** from **${this.guild.name}** for **${humanize(this._duration)}**`)
            .addField(`Reason`, `\`\`\`${this.reason}\`\`\``)
            .setFooter({text: `${this.guild.name}`, iconURL: this.guild.iconURL()})
    }

    /**
     * Perform the mute in the guild
     */
    override async execute(): Promise<boolean>
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
}