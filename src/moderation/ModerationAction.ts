import {MessageEmbed, User, TextBasedChannel, Guild, Message, SelectMenuInteraction} from 'discord.js';
import { DbManager } from '../db/DbManager';
import { DbTypes } from '../db/DbTypes';
import { CommandError } from '../errors/CommandError';
import { Command } from '@sapphire/framework';
import ModActionDbType = DbTypes.ModActionDbType;
import { ClientWrapper } from '../ClientWrapper';
import DurationActionDbType = DbTypes.DurationActionDbType;
import adler from 'adler-32';
import {CommandCheckOptions} from "../interfaces/CommandCheckOptions";
import {DurationModerationAction} from "./DurationModerationAction";
import {ModActionExecutor} from "./ModActionExecutor";

export abstract class ModerationAction
{
	// -------------------------------------------- //
	// FIELDS
	// -------------------------------------------- //

	// Name of this type of moderation action
	private _type: string;
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
	// unique identifier of this action
	private _id: string;
	// Checks that need to be performed before this action is executed
	private _executionChecks: CommandCheckOptions;
	// Checks that need to be performed before this action is undone
	private _undoChecks: CommandCheckOptions;
	// function to generate this string that is displayed to the command executor when the action performs successfully
	private _successMsgFunc: () => string;
	//TODO comment field

	// -------------------------------------------- //
	// CONSTRUCTORS
	// -------------------------------------------- //

	// Default constructor
	constructor(target: User, reason: string, issuer: User, timestamp: number, guild: Guild, channel: TextBasedChannel, silent: boolean, options: { id?: string, type?: string })
	{
		this.type = options.type ?? this.constructor.name;
		this.target = target;
		this.reason = reason;
		this.issuer = issuer;
		this.timestamp = timestamp;
		this.guild = guild;
		this.channel = channel;
		this.silent = silent;

		// Hash the issuer's id and the timestamp into a unique identifier
		this.id = options.id ?? adler.str(this.issuer.id + this.timestamp).toString(35);
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

	get type(): string
	{
		return this._type;
	}

	set type(value: string)
	{
		this._type = value;
	}

	get id(): string
	{
		return this._id;
	}

	set id(id: string)
	{
		this._id = id;
	}

	get executionChecks(): CommandCheckOptions {
		return this._executionChecks;
	}

	set executionChecks(value: CommandCheckOptions) {
		this._executionChecks = value;
	}

	get undoChecks(): CommandCheckOptions {
		return this._undoChecks;
	}

	set undoChecks(value: CommandCheckOptions) {
		this._undoChecks = value;
	}

	get successMsgFunc(): () => string {
		return this._successMsgFunc;
	}

	set successMsgFunc(value: () => string) {
		this._successMsgFunc = value;
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
				message: 'Database error ',
				emoji: '<:database:1000894887429943327>',
				additionalEmbedData: {
					color: '#FFCC00'
				}
			});

		// Attempt to execute the moderation action in the guild
		const success = await this.execute();
		// If command was not executed successfully
		if (!success)
		{
			// Remove the action from the db
			await DbManager.deleteAction(document);

			// Return an error
			return new CommandError({
				message: 'Command did not execute correctly',
				emoji: '<:cancel1:1001219492573089872>',
				additionalEmbedData: {
					color: '#FFCC00'
				}
			});
		}


		// Inform user
		const message = await this.informUser();
		// If message could not be sent to user
		if (!message)
			// Return an error
			return new CommandError({
				message: 'error sending message to user. Command execution was successful',
				emoji: '<:errormessage:1000894890441453748>',
				additionalEmbedData: {
					color: '#FFCC00'
				}
			});

		// Indicate success
		return null;
	}

	/**
	 * Inform the target user about this moderation action
	 */
	protected async informUser(): Promise<Message>
	{
		try
		{
			// Use the abstract method to generate an embed for this moderation action and send the embed to the target of the moderation action.
			// This might fail because there are situations where the bot cannot message the user
			return await this.target.send({ embeds: [this.toMessageEmbed()] });
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

	async undo(interaction: SelectMenuInteraction, reason: string)
	{
		return ModActionExecutor.execute(this.genUndoAction(interaction, reason), interaction);
	}

	/**
	 * Generate a database object from this action
	 */
	protected toDbObj(): ModActionDbType | DurationActionDbType
	{
		return new ModActionDbType(
			this.constructor.name,
			this.reason,
			this.issuer.id,
			this.target.id,
			this.guild.id,
			this.channel.id,
			this.silent,
			this.timestamp,
			this.id
		);
	}

	public toString(): string
	{
		return `User: ${this.target}`
			+ `\n Moderator: ${this.issuer}`
			+ `\n Reason: ${this.reason}`
			+ `\n Date: <t:${Math.trunc(this.timestamp / 1000)}:F>`
			+ `\n Id: ${this.id}`;
	}

	// -------------------------------------------- //
	// ABSTRACT
	// -------------------------------------------- //
	abstract execute(): Promise<boolean>

	/**
	 * Generate a corresponding moderation action to undo this one. Some data is the same in the original and undo action, for example the target.
	 * Other data needs to be taken from the provided SelectMenuInteraction, for example the new issuer
	 * @param interaction a SelectMenuInteraction providing the data of the user trying to issue the undo action
	 * @param reason the reason for the undo must be passed as a string, since it cannot be obtained from the SelectMenuInteraction
	 * @param duration optional parameter for when the undo action requires a duration, for example a ban or mute
	 */
	abstract genUndoAction(interaction: SelectMenuInteraction, reason: string, duration?: number): ModerationAction | DurationModerationAction | null

	abstract toMessageEmbed(): MessageEmbed
}