import {Guild, MessageEmbed, ModalSubmitInteraction, SelectMenuInteraction, TextBasedChannel, User} from "discord.js";
import {CommandError} from "../../errors/CommandError";
import {DbManager} from "../../db/DbManager";
import {Command} from "@sapphire/framework";
import {ModerationAction} from "../ModerationAction";
import {Unban} from "./Unban";
import {ClientWrapper} from "../../ClientWrapper";
import {DbTypes} from "../../db/DbTypes";
import ModActionDbType = DbTypes.ModActionDbType;

export class Kick extends ModerationAction
{
    // -------------------------------------------- //
    // STATIC FACTORIES
    // -------------------------------------------- //
    public static async interactionFactory(interaction: Command.ChatInputInteraction): Promise<Kick>
    {
        // get the command arguments
        const target = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason', true);
        const silent = interaction.options.getBoolean('silent', false) ?? false;

        // Create and return a new object
        return new Kick(
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

    public static async dbFactory(document: ModActionDbType): Promise<Kick>
    {
        try
        {
            // Fetch fields and return a new object
            return new Kick(
                await ClientWrapper.get().users.fetch(document.targetId),
                document.reason,
                await ClientWrapper.get().users.fetch(document.issuerId),
                document.timestamp,
                await ClientWrapper.get().guilds.fetch(document.guildId),
                await ClientWrapper.get().channels.fetch(document.channelId) as TextBasedChannel,
                document.silent,
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
    constructor(target: User, reason: string, issuer: User, timestamp: number, guild: Guild, channel: TextBasedChannel, silent: boolean, options: { id?: string, type?: string }) {
        super(target, reason, issuer, timestamp, guild, channel, silent, options);

        // Set the required permission checks that need to be executed before this action runs
        this.executionChecks = {checkTargetIsBelowIssuer: true, checkTargetIsBelowClient: true, checkTargetIsInGuild: true, checkIssuerHasPerm: "KICK_MEMBERS"}

        // Set the success message that will be shown to the command executor after the command runs successfully
        this.successMsgFunc = () => `${this.target} kicked`

        // Set this action as not having an undo action
        this.hasUndo = false;
        // Set the at the undo action (Nothing) does not require a duration to be entered
        this.undoRequiresDuration = false;
    }

    // -------------------------------------------- //
    // METHODS
    // -------------------------------------------- //
    public override async run(): Promise<CommandError | null>
    {
        // -------------------------------------------- //
        // This method needs to be overriden because Kicks need to be performed in a different order
        // -------------------------------------------- //

        // Record this action to db
        const document = await this.recordToDb();
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

    /**
     * Perform the kick in the guild
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
            // Attempt to kick the user via the api
            await member.kick(this.reason)
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
        return null;
    }
}