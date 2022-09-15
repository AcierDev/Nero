import { MessageActionRow, MessageEmbed, MessageEmbedOptions, MessageSelectMenu } from 'discord.js';
import { ModerationAction } from '../moderation/ModerationAction';
import { DurationModerationAction } from '../moderation/DurationModerationAction';

export class HistoryPage
{
    // -------------------------------------------- //
    // FIELDS
    // -------------------------------------------- //

    private _embed: MessageEmbed;
    private _actions: (ModerationAction | DurationModerationAction)[];

    // -------------------------------------------- //
    // CONSTRUCTOR
    // -------------------------------------------- //

    constructor(embedOptions: MessageEmbedOptions)
    {
        this.embed = new MessageEmbed(embedOptions);
        this.actions = [];
    }

    // -------------------------------------------- //
    // MEMBER FUNCTIONS
    // -------------------------------------------- //

    public addAction(action: ModerationAction | DurationModerationAction)
    {
        // Add the action to the embed
        this.embed.addFields({name: action.type, value: action.toString(), inline: false});

        // Add the actions id
        this.actions.push(action);
    }

    public getDropdown()
    {
        return new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('remove_menu')
                    .setPlaceholder('Undo an action')
                    .setOptions(
                        this.actions.map(action => {
                            return {
                                label: `${action.type} - ${action.id}`,
                                description: `Remove this action from user's history`,
                                value: action.id,
                            }
                        })
                    )
                    .setMaxValues(1)
            )
    }

    // -------------------------------------------- //
    // GETTERS AND SETTERS
    // -------------------------------------------- //

    get actions(): (ModerationAction | DurationModerationAction)[]
    {
        return this._actions;
    }

    set actions(value: (ModerationAction | DurationModerationAction)[])
    {
        this._actions = value;
    }

    get embed(): MessageEmbed
    {
        return this._embed;
    }

    set embed(value: MessageEmbed)
    {
        this._embed = value;
    }
}