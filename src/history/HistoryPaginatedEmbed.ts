import {PaginatedEmbed} from '../util/PaginatedEmbed';
import { MessageActionRow, MessageButton, MessageEmbed, MessageEmbedOptions } from 'discord.js';
import {ClientWrapper} from '../ClientWrapper';
import {DurationModerationAction} from "../moderation/DurationModerationAction";
import {ModerationAction} from "../moderation/ModerationAction";
import { HistoryPage } from './HistoryPage';

export class HistoryPaginatedEmbed extends PaginatedEmbed
{
    // -------------------------------------------- //
    // FIELDS
    // -------------------------------------------- //

    private _historyPages: HistoryPage[];

    // -------------------------------------------- //
    // CONSTRUCTOR
    // -------------------------------------------- //

    constructor(options: { maxFields?: number, embedOptions?: MessageEmbedOptions })
    {
        super(options);

        this.historyPages = [];
    }

    // -------------------------------------------- //
    // MEMBER FUNCTIONS
    // -------------------------------------------- //

    private addAction(action: ModerationAction | DurationModerationAction)
    {
        // For every page
        for (const page of this.historyPages)
        {
            // If there's room in the page
            if (page.embed.fields.length < this.maxFields)
            {
                // Add the action to the page
                page.addAction(action);
                return;
            }
        }

        // Else if there was no room in a page, create a new page
        this.createPage();
        // Recurse
        this.addAction(action)
    }

    protected override createPage()
    {
        // Create and push a new page
        this.historyPages.push(new HistoryPage(this.embedOptions));

        // Refresh the page number footers
        this.refreshFooters()
    }

    protected override refreshFooters()
    {
        for (let i = 0; i < this.historyPages.length; i++)
        {
            this.historyPages[i].embed.setFooter({text: `page: ${i + 1}/${this.historyPages.length}`})
        }
    }

    private getCurrPage(): HistoryPage
    {
        return this.historyPages.at(this.currPage);
    }

    private getCurrEmbed(): MessageEmbed
    {
        return this.getCurrPage().embed
    }

    private getDropDown(): MessageActionRow
    {
        return this.getCurrPage().getDropdown();
    }

    public override getMessage()
    {
        // If the user does not have a moderation history
        if (this.historyPages.length == 0)
            return {
                embeds: [
                    new MessageEmbed()
                        .setColor('YELLOW')
                        .setDescription('No moderation history found')
                        //.setTimestamp()
                ],
                components: [],
                fetchReply: true,
            }

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('prev_button')
                    .setLabel('previous')
                    .setStyle('PRIMARY')
                    .setDisabled(this.currPage == 0),
                new MessageButton()
                    .setCustomId('next_button')
                    .setLabel('next')
                    .setStyle('PRIMARY')
                    .setDisabled(this.currPage == this.historyPages.length - 1)
            )

        return {
            embeds: [this.getCurrEmbed()],
            components: [this.getDropDown(), row],
            fetchReply: true,
        }
    }

    // -------------------------------------------- //
    // GETTERS AND SETTERS
    // -------------------------------------------- //

    get historyPages(): HistoryPage[]
    {
        return this._historyPages;
    }

    set historyPages(value: HistoryPage[])
    {
        this._historyPages = value;
    }

    // -------------------------------------------- //
    // STATIC FACTORY
    // -------------------------------------------- //

    /**
     * Generate a paginated embed from an array of moderation actions and some options
     * @param actions Array of moderation actions deserialized from the db
     * @param options Guild id, User id, maximum fields per page, embed options
     */
    public static async generate(actions: (ModerationAction | DurationModerationAction)[], options: { guildId: string, userId?: string, maxFields?: number, embedOptions?: MessageEmbedOptions })
    {
        // intercept the embed options that were passed and assign the thumbnail to either be the user's icon, or the guild's icon
        options.embedOptions.thumbnail = {
            url: await this.getThumbnail({guildId: options.guildId, userId: options.userId})
        }

        // intercept the embed options that were passed and prefix the embed title
        options.embedOptions.title = await this.getTitlePrefix({guildId: options.guildId, userId: options.userId}) + options.embedOptions.title;

        // Generate a paginated embed
        const historyPaginated =  new HistoryPaginatedEmbed({maxFields: options.maxFields, embedOptions: options.embedOptions});

        // For each action, push it to the paginated object as a field
        actions.forEach(action =>
        {
            historyPaginated.addAction(action)
        });

        // Return the paginated embed
        return historyPaginated;
    }

    // -------------------------------------------- //
    // STATIC FUNCTIONS
    // -------------------------------------------- //

    // If a userId is provided, fetch its avatar url. If not, fetch the provided guild's icon
    private static async getThumbnail(options: {guildId: string, userId?: string})
    {
        if (options.userId)
        {
            // Fetch user and return their avatarURL
            return (await ClientWrapper.get().users.fetch(options.userId)).avatarURL()
        } else
        {
            // Fetch guild and return its iconURL
            return (await ClientWrapper.get().guilds.fetch(options.guildId)).iconURL()
        }
    }

    // If a userId is provided, return their username, otherwise return the guild's name
    private static async getTitlePrefix(options: {guildId: string, userId?: string})
    {
        if (options.userId)
        {
            // Fetch user and return their avatarURL
            return (await ClientWrapper.get().users.fetch(options.userId)).username + `'s `;
        } else
        {
            return "Server ";
        }
    }
}