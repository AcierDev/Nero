import {Guild, MessageEmbed, ModalSubmitInteraction, SelectMenuInteraction, TextBasedChannel, User,} from "discord.js";
import humanize from 'humanize-duration';
import {TimeUtil} from "../../util/TimeUtil";
import {Command} from "@sapphire/framework";
import {DurationModerationAction} from "../DurationModerationAction";
import {Unban} from "./Unban";
import {Unmute} from "./Unmute";
import {ClientWrapper} from "../../ClientWrapper";
import {DbTypes} from "../../db/DbTypes";
import DurationActionDbType = DbTypes.DurationActionDbType;
import config from '../../config.json'

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

    public static async dbFactory(document: DurationActionDbType): Promise<Mute>
    {
        try
        {
            // Fetch fields and return a new object
            return new Mute(
                await ClientWrapper.get().users.fetch(document.targetId),
                document.reason,
                await ClientWrapper.get().users.fetch(document.issuerId),
                document.timestamp,
                await ClientWrapper.get().guilds.fetch(document.guildId),
                await ClientWrapper.get().channels.fetch(document.channelId) as TextBasedChannel,
                document.silent,
                document.duration,
                { id: document.id, type: document.type }
            );
        } catch (e)
        {
            // Stack trace
            console.log(e);
            return null;
        }
    }

    // -------------------------------------------- //
    // CONSTRUCT
    // -------------------------------------------- //
    constructor(target: User, reason: string, issuer: User, timestamp: number, guild: Guild, channel: TextBasedChannel, silent: boolean, duration: number, options: { id?: string, type?: string }) {
        super(target, reason, issuer, timestamp, guild, channel, silent, duration, options);

        // Set the required permission checks that need to be executed before this action runs
        this.executionChecks = {checkTargetIsBelowIssuer: true, checkTargetIsBelowClient: true, checkTargetIsInGuild: true, checkIssuerHasRole: config.commands.kick.guilds[this.guild.id]};

        // Set the success message that will be shown to the command executor after the command runs successfully
        this.successMsgFunc = () => `${this.target} muted for **${humanize(this.duration)}**`

        // Set this action as having an undo action
        this.hasUndo = true;
        // Set the at the undo action (Unmute) does not require a duration to be entered
        this.undoRequiresDuration = false;
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
            .addFields({name: `Reason`, value: `\`\`\`${this.reason}\`\`\``})
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

    override genUndoAction(interaction: ModalSubmitInteraction, reason: string) {
        return new Unmute(this.target, reason, interaction.user, Date.now(), this.guild, interaction.channel, interaction.ephemeral, {})
    }
}