import {MessageEmbed, User, TextBasedChannel, Guild} from "discord.js";
import {ClientWrapper} from "../../ClientWrapper";

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

    //TODO constructor for id's

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

    /**
     * Execute the moderation action
     */
    public async execute(): Promise<boolean>
    {
        return await this.recordToDb() && await this.sendActionToPlayer() && this.perform();
    }

    /**
     * Inform the target user about this moderation action
     */
    private async sendActionToPlayer(): Promise<boolean>
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

    // -------------------------------------------- //
    // ABSTRACT
    // -------------------------------------------- //

    /**
     * Generate a discord embed providing the details of this moderation action
     */
    abstract genEmbed(): MessageEmbed;

    /**
     * Record the moderation action to the database
     */
    abstract recordToDb(): Promise<boolean>;

    /**
     * Perform moderation actions in the guild (if applicable)
     */
    abstract perform(): Promise<boolean>;
}