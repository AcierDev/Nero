import {DbTypes} from "../db/DbTypes";
import ModActionDbObj = DbTypes.ModActionDbType;
import DurationModActionDbObj = DbTypes.DurationActionDbType;
import {DbManager} from "../db/DbManager";
import {PaginatedEmbed} from "./PaginatedEmbed";
import {ModerationAction} from "../moderation/actions/ModerationAction";
import {DurationModerationAction} from "../moderation/actions/DurationModerationAction";
import DurationActionDbType = DbTypes.DurationActionDbType;

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
                : await DbManager.fetchLogs({_guildId: guildId})

        // Convert all the db documents into moderation action objects
        const actions = await Promise.all(docs.map(async doc =>
        {
            if (doc.clazzName == 'ModActionDbType')
            {
                return ModerationAction.dbFactory(doc)
            }
            else if (doc.clazzName == 'DurationActionDbType')
            {
                return DurationModerationAction.dbFactory(doc as DurationActionDbType)
            }
        }))

        // Create a paginated embed
        const paginated = new PaginatedEmbed({maxFields: 5, embedOptions: {title: "Moderation History"}})

        // For each action, push it to the paginated object as a field
        actions.forEach(action =>
        {
            paginated.addField({
                name: action.type,
                value: action.toString(),
                inline: false
            })
        })

       return paginated;
    }
}