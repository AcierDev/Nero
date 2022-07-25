import {MessageEmbed, User, TextBasedChannel, Guild, Message} from "discord.js";
import {DbManager} from "../../db/DbManager";
import {DbTypes} from "../../db/types/DbTypes";
import ModActionDbObj = DbTypes.ModActionDbObj;
import DurationModActionDbObj = DbTypes.DurationModActionDbObj;
import {CommandError} from "../../errors/CommandError";

export abstract class AbstractModerationAction
{
    // -------------------------------------------- //
    // FIELDS
    // -------------------------------------------- //

    // user being moderated
    private _target: User;
    // Reason provided for this moderation action
    private _reason: string;
    // user issuing this moderation action
    private _issuer: User;
    // Timestamp of the moderation action
    private _timestamp: number;
    // Guild this action was issued in
    private _guild: Guild;
    // Channel id that this action was issued in
    private _channel: TextBasedChannel;
    // Whether to display the moderation action in chat
    private _silent: boolean;
    //TODO comment field

    // -------------------------------------------- //
    // CONSTRUCTORS
    // -------------------------------------------- //

    // Default constructor
    constructor(target: User, reason: string, issuer: User, timestamp: number, guild: Guild, channel: TextBasedChannel, silent: boolean)
    {
        this._target = target;
        this._reason = reason;
        this._issuer = issuer;
        this._timestamp = timestamp;
        this._guild = guild;
        this._channel = channel;
        this._silent = silent;
    }

    // -------------------------------------------- //
    // GETTERS AND SETTERS
    // -------------------------------------------- //

    get target(): User
    {
        return this._target;
    }

    set target(value: User)
    {
        this._target = value;
    }

    get reason(): string
    {
        return this._reason;
    }

    set reason(value: string)
    {
        this._reason = value;
    }

    get issuer(): User
    {
        return this._issuer;
    }

    set issuer(value: User)
    {
        this._issuer = value;
    }

    get timestamp(): number
    {
        return this._timestamp;
    }

    set timestamp(value: number)
    {
        this._timestamp = value;
    }

    get guild(): Guild
    {
        return this._guild;
    }

    set guild(value: Guild)
    {
        this._guild = value;
    }

    get channel(): TextBasedChannel
    {
        return this._channel;
    }

    set channel(value: TextBasedChannel)
    {
        this._channel = value;
    }

    get silent(): boolean
    {
        return this._silent;
    }

    set silent(value: boolean)
    {
        this._silent = value;
    }

    // -------------------------------------------- //
    // METHODS
    // -------------------------------------------- //

    /**
     * Record action to db, execute action in the guild, inform user via private message
     * @returns CommandExecutionError - if any was encountered, null otherwise
     */
    public async run(): Promise<CommandError | null>
    {
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


        // Inform user
        const message = await this.informUser();
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
     * Inform the target user about this moderation action
     */
    public async informUser(): Promise<Message>
    {
        try
        {
            // Use the abstract method to generate an embed for this moderation action and send the embed to the target of the moderation action.
            // This might fail because there are situations where the bot cannot message the user
            return await this.target.send({embeds: [this.genEmbed()]})
        } catch (e)
        {
            //Stack trace
            console.log(e);
            //Indicate the message was not sent
            return null;
        }
    }

    /**
     * Record the moderation action to the database
     */
    protected async recordToDb()
    {
        // Insert the action into the database
        return await DbManager.storeAction(this.toDbObj());
    };

    // -------------------------------------------- //
    // ABSTRACT
    // -------------------------------------------- //

    /**
     * Generate a database object from this action
     */
    abstract toDbObj(): ModActionDbObj | DurationModActionDbObj

    /**
     * Generate a discord embed providing the details of this moderation action
     */
    abstract genEmbed(): MessageEmbed;

    /**
     * Perform moderation actions in the guild (if applicable)
     */
    abstract execute(): Promise<boolean>;
}