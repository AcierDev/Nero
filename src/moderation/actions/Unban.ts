import {ModerationAction} from "../ModerationAction";
import {Guild, MessageEmbed, ModalSubmitInteraction, SelectMenuInteraction, TextBasedChannel, User} from "discord.js";
import {CommandError} from "../../errors/CommandError";
import {DbManager} from "../../db/DbManager";
import {Command} from "@sapphire/framework";
import {Ban} from "./Ban";
import {ClientWrapper} from "../../ClientWrapper";
import {DbTypes} from "../../db/DbTypes";
import ModActionDbType = DbTypes.ModActionDbType;

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

    public static async dbFactory(document: ModActionDbType): Promise<Unban>
    {
        try
        {
            // Fetch fields and return a new object
            return new Unban(
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
        this.executionChecks = {checkIssuerHasPerm: "BAN_MEMBERS", checkTargetBanned: true};

        // Set the success message that will be shown to the command executor after the command runs successfully
        this.successMsgFunc = () => `${this.target} unbanned`
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

    override genUndoAction(interaction: ModalSubmitInteraction, reason: string, duration) {
        return new Ban(this.target, reason, interaction.user, Date.now(), this.guild, interaction.channel, interaction.ephemeral, duration, {})
    }

    override toMessageEmbed(): MessageEmbed {
        // This doesn't need to be defined since an unban is never sent to the user
        return undefined;
    }
}