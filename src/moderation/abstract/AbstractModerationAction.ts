import {MessageEmbed, User, TextBasedChannel, Guild} from "discord.js";
import {DbManager} from "../../db/DbManager";
import {DbTypes} from "../../db/types/DbTypes";
import ModActionDbObj = DbTypes.ModActionDbObj;
import DurationModActionDbObj = DbTypes.DurationModActionDbObj;
import {Command} from "@sapphire/framework";
import {CommandExecutionError} from "../../errors/CommandExecutionError";

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
     * Perform the moderation action in the guild
     * @returns CommandExecutionError - if any was encountered, null otherwise
     */
    public async execute(): Promise<CommandExecutionError | null>
    {
        // Record to db
        if (!await this.recordToDb())
            return new CommandExecutionError({message: "**Error:** Database operations error. Command was not executed"})
        // Execute action
        if (!await this.perform())
            return new CommandExecutionError({
                message: "**Error:** Database operations were successful and the command was recorded. There was an error in command execution." +
                    " Do not expect the command to have been executed. User was not informed of this moderation action"
            })
        // Inform user
        if (!await this.messageTarget())
            return new CommandExecutionError({
                message: "**Error:** There was an error informing the user about this moderation action. They have not received a private message." +
                    " However, the command executed successfully, and all database operations were successful. This action will show in their history"
            })

        // Indicate success
        return null;
    }

    /**
     * Inform the target user about this moderation action
     */
    public async messageTarget(): Promise<boolean>
    {
        try
        {
            // Use the abstract method to generate an embed for this moderation action and send the embed to the target of the moderation action.
            // This might fail because there are situations where the bot cannot message the user
            await this.target.send({embeds: [this.genEmbed()]})

            // Indicate the message was sent
            return true;
        } catch (e)
        {
            //Stack trace
            console.log(e);

            //Indicate the message was not sent
            return false;
        }
    }

    /**
     * Record the moderation action to the database
     */
    protected async recordToDb(): Promise<boolean>
    {
        // Insert the action into the database
        const dbObj = await DbManager.storeAction(this.toDbObj());

        console.log(await DbManager.fetchAction(dbObj));
        return true;
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
    abstract perform(): Promise<boolean>;
}