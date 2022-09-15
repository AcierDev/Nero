import { ModerationAction } from './ModerationAction';
import { DurationBasedAction } from '../interfaces/DurationBasedAction';
import { Guild, TextBasedChannel, User } from 'discord.js';
import { Command } from '@sapphire/framework';
import { TimeUtil } from '../util/TimeUtil';
import { DbTypes } from '../db/DbTypes';
import DurationModActionDbObj = DbTypes.DurationActionDbType;
import DurationActionDbType = DbTypes.DurationActionDbType;
import { ClientWrapper } from '../ClientWrapper';
import humanize from 'humanize-duration';

export abstract class DurationModerationAction extends ModerationAction implements DurationBasedAction
{
	// -------------------------------------------- //
	// ADDITIONAL FIELDS
	// -------------------------------------------- //
	_duration: number;

	// -------------------------------------------- //
	// CONSTRUCTOR
	// -------------------------------------------- //
	protected constructor(target: User, reason: string, issuer: User, timestamp: number, guild: Guild, channel: TextBasedChannel, silent: boolean, duration: number, options: { id?: string, type?: string })
	{
		// Pass to super
		super(target, reason, issuer, timestamp, guild, channel, silent, { id: options?.id, type: options?.type });

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
		return Math.min(0, this.duration - (Date.now() - this.timestamp));
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
		);
	}

	public toString(): string
	{
		return `User: ${this.target}`
			+`\n Moderator: ${this.issuer}`
			+ `\n Reason: **${this.reason}**`
			+ `\n Duration: **${this.duration == null ? 'indefinite' : humanize(this.duration)}**`
			+ `\n Date: <t:${Math.trunc(this.timestamp / 1000)}:F>`
			+ `\n Id: **${this.id}**`;
	}
}