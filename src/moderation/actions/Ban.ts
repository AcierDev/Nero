import {CommandError} from "../../errors/CommandError";
import {DbManager} from "../../db/DbManager";
import {DurationModerationAction} from "../DurationModerationAction";
import {Command} from "@sapphire/framework";
import {TimeUtil} from "../../util/TimeUtil";
import {
    CacheType,
    Guild,
    MessageEmbed,
    ModalSubmitInteraction,
    SelectMenuInteraction,
    TextBasedChannel,
    User
} from "discord.js";
import humanize from 'humanize-duration';
import {Unban} from "./Unban";
import {ClientWrapper} from "../../ClientWrapper";
import {DbTypes} from "../../db/DbTypes";
import DurationActionDbType = DbTypes.DurationActionDbType;
import {ModerationAction} from "../ModerationAction";

export class Ban extends DurationModerationAction {
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
        if (durationString && !duration)
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
            {}
        );
    }

    public static async dbFactory(document: DurationActionDbType): Promise<Ban>
    {
        try
        {
            // Fetch fields and return a new object
            return new Ban(
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
        this.executionChecks = {checkTargetIsBelowIssuer: true, checkTargetIsBelowClient: true, checkIssuerHasPerm: "BAN_MEMBERS"};

        // Set the success message that will be shown to the command executor after the command runs successfully
        this.successMsgFunc = () => `${this.target} banned ${this.duration ? `for **${humanize(this.duration)}**` : ''}`

        // Set this action as having an undo action
        this.hasUndo = true;
        // Set the at the undo action (Unban) does not require a duration to be entered
        this.undoRequiresDuration = false;
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
                message: "Ban executed successfully, but there was an error informing the user.",
                emoji: '<:errormessage:1000894890441453748>',
                additionalEmbedData: {
                    color: '#FFCC00'
                }
            })

        // Indicate success
        return null;
    }

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

    override toMessageEmbed(): MessageEmbed
    {
        return new MessageEmbed()
            .setTitle('You were kicked')
            .setColor('#FF3131')
            .setThumbnail(this.guild.iconURL())
            .setDescription(`${this.target} you have been **Kicked** from **${this.guild.name}**`)
            .addFields({name: `Reason`, value: `\`\`\`${this.reason}\`\`\``})
            .setFooter({ text: `${this.guild.name}`, iconURL: this.guild.iconURL() })
    }

    override genUndoAction(interaction: ModalSubmitInteraction, reason: string) {
        return new Unban(this.target, reason, interaction.user, Date.now(), this.guild, interaction.channel, interaction.ephemeral, {})
    }
}