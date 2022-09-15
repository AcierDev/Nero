import {
    MessageEmbed,
    ModalSubmitInteraction,
    SelectMenuInteraction,
} from "discord.js";
import {DbManager} from "../db/DbManager";
import {CommandError} from "../errors/CommandError";
import {HistoryUtil} from "../util/HistoryUtil";
import {ModalGenerator} from "../util/ModalGenerator";
import {ModActionExecutor} from "./ModActionExecutor";
import {InteractionUtil} from "../util/InteractionUtil";
import {TimeUtil} from "../util/TimeUtil";

export class ModActionUndoer
{
    public static async handleSelectMenu(selectMenuInteraction: SelectMenuInteraction)
    {

        // Ensure the select menu is a history undo menu
        if (selectMenuInteraction.customId !== 'remove_menu') return;
        // If more than one option was selected from the removal menu
        if (selectMenuInteraction.values.length !== 1)
        {
            await selectMenuInteraction.reply('Only one moderation action can be undone at once')
            return;
        }

        // Get the moderation action id that was selected
        const id = selectMenuInteraction.values[0];

        // Fetch the action with the provided id from the db
        const dbObj = await DbManager.fetchLog({_id: id});
        // If the action is not found
        if (! dbObj)
            return new CommandError({
                message: 'Action could not be retrieved from the database',
                emoji: '<:database:1000894887429943327>',
                additionalEmbedData: {
                    color: '#FFCC00'
                }
            })

        // Convert the object that was retrieved from the database into a moderation action
        const action = await HistoryUtil.docToAction(dbObj);
        // Check if there is no such undo action. For example, a Warning and Kick cannot be undone and so a null value will be returned
        if (!action.hasUndo)
        {
            // Reply with error
            await selectMenuInteraction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor("YELLOW")
                        .setDescription('<:cancel1:1001219492573089872> This action cannot be undone')
                ],
                ephemeral: selectMenuInteraction.ephemeral
            })
            // Exit
            return;
        }

        // Create a nice modal for the user to enter the reason for them undoing this moderation action
        const modal = ModalGenerator.genReasonModal(action);
        // Show the user the modal
        await selectMenuInteraction.showModal(modal);
        // Create a filter for modal interactions
        const filter = (modalInteraction) => modalInteraction.customId === 'reasonModal' && modalInteraction.user.id == selectMenuInteraction.user.id;
        // Await the modal's submission
        await selectMenuInteraction.awaitModalSubmit({filter, time: 60_000})
            .then(async modal =>
            {
                // Make sure that we only process the first modal we receive. We don't want to process 3 modal's at once
                if (! InteractionUtil.isUnique(modal.id)) return;

                // Defer because things might take a while
                await modal.deferReply()
                // Get the reason that the user entered
                const reason = modal.fields.getTextInputValue('reason')

                // Declare a blank duration variable equal to null, if no duration is entered by the user, this will remain null.
                // If the user enters a duration it will be parsed and assigned to this variable
                let duration;
                // If the undo requires a duration, get it from the modal
                let durationString = action.undoRequiresDuration ? modal.fields.getTextInputValue('duration') : null;
                if (durationString)
                    duration = TimeUtil.generateDuration(durationString.split(" "));

                // Generate a moderation action that undoes this moderation action
                const undoAction = action.genUndoAction(modal, reason, duration);

                return await ModActionExecutor.execute(undoAction, modal)

            }).catch(err => console.error(err))
    }
}