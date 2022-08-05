import {DbTypes} from '../db/DbTypes';
import ModActionDbObj = DbTypes.ModActionDbType;
import DurationModActionDbObj = DbTypes.DurationActionDbType;
import {DbManager} from '../db/DbManager';
import {PaginatedEmbed} from './embeds/PaginatedEmbed';
import {ModerationAction} from '../moderation/types/ModerationAction';
import {DurationModerationAction} from '../moderation/types/DurationModerationAction';
import DurationActionDbType = DbTypes.DurationActionDbType;
import {HistoryPaginatedEmbed} from './embeds/HistoryPaginatedEmbed';

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
        const paginated = await HistoryPaginatedEmbed.generate(actions, {
            guildId: guildId,
            userId: options.userId,
            maxFields: 5,
            embedOptions: {title: 'Moderation History'}
        });

        return paginated;
    }

    /**
     * convert an array of db objects into an array of Moderation's and DurationModerationAction's
     * @param docs db docs to be deserialized
     */
    private static async convertDocsToActions(docs: (ModActionDbObj | DurationModActionDbObj)[]): Promise<(ModerationAction | DurationModerationAction)[]>
    {
        return await Promise.all(docs.map(doc =>
        {
            if (doc.clazzName == 'ModActionDbType')
            {
                return ModerationAction.dbFactory(doc);
            }
            else if (doc.clazzName == 'DurationActionDbType')
            {
                return DurationModerationAction.dbFactory(doc as DurationActionDbType);
            }
        }));
    }
}