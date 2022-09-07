import {DbTypes} from '../db/DbTypes';
import {DbManager} from '../db/DbManager';
import {PaginatedEmbed} from './PaginatedEmbed';
import {ModerationAction} from '../moderation/ModerationAction';
import {DurationModerationAction} from '../moderation/DurationModerationAction';
import {HistoryPaginatedEmbed} from '../history/HistoryPaginatedEmbed';
import ModActionDbObj = DbTypes.ModActionDbType;
import DurationActionDbType = DbTypes.DurationActionDbType;
import DurationModActionDbObj = DbTypes.DurationActionDbType;
import {exportedClasses} from "../Exports";

export class HistoryUtil
{
    public static async fetchHistoryEmbed(guildId: string, options: { userId?: string }): Promise<PaginatedEmbed>
    {
        // Fetch the logs for the user if a user was provided, if not fetch the entire guild's logs
        const docs: (ModActionDbObj | DurationModActionDbObj)[] =
            // Check if a user id was provided
            (options.userId)
                // If a user id was provided fetch the user's logs in the guild
                ? await DbManager.fetchLogs({_guildId: guildId, _targetId: options.userId})
                // Else fetch the entire guild's logs
                : await DbManager.fetchLogs({_guildId: guildId});

        // Convert all the db documents into moderation action objects
        const actions = await this.convertDocsToActions(docs);

        // Create a paginated embed
        return await HistoryPaginatedEmbed.generate(actions, {
            guildId: guildId,
            userId: options.userId,
            maxFields: 6,
            embedOptions: {title: 'Moderation History'}
        });
    }

    /**
     * convert an array of db objects into an array of Moderation's and DurationModerationAction's
     * @param docs db docs to be deserialized
     */
    private static async convertDocsToActions(docs: (ModActionDbObj | DurationModActionDbObj)[])
    {
        return await Promise.all(docs.map(doc =>
        {
            return this.docToAction(doc);
        }));
    }

    public static async docToAction(doc: ModActionDbObj | DurationModActionDbObj)
    {
        console.log((await exportedClasses[doc.type].dbFactory(doc)).constructor.name);
        return await exportedClasses[doc.type].dbFactory(doc);
    }
}