import {MessageActionRow, Modal, SelectMenuInteraction, TextInputComponent, TextInputStyleResolvable} from "discord.js";
import {DbManager} from "../db/DbManager";
import {CommandError} from "../errors/CommandError";
import {HistoryUtil} from "../util/HistoryUtil";
import {TextInputStyle} from "discord-api-types/v9";

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

        // Create a nice modal for the user to enter the reason for them undoing this moderation action
        const modal = new Modal()
            .setCustomId('reasonModal')
            .setTitle('Provide a reason')
            .addComponents(
                new MessageActionRow<TextInputComponent>()
                    .addComponents(
                        new TextInputComponent()
                            .setCustomId('reason')
                            .setLabel('enter a reason for this moderation action')
                            .setStyle(TextInputStyle.Paragraph as unknown as TextInputStyleResolvable)
                            .setRequired(true)
                    )
            )

        // Show the user the modal
        await selectMenuInteraction.showModal(modal);

        // Create a filter for modal interactions
        const filter = (modalInteraction) => modalInteraction.customId === 'reasonModal' && modalInteraction.user.id == selectMenuInteraction.user.id;

        await selectMenuInteraction.awaitModalSubmit({filter, time: 60_000})
            .then(modal => {

                const reason = modal.fields.getTextInputValue('reason')

                // Get the moderation action id that was selected
                const id = selectMenuInteraction.values[0];

                this.undoActionId(id, selectMenuInteraction, reason)

            }).catch(err => console.error(err))
    }

    private static async undoActionId(id: string, interaction: SelectMenuInteraction, reason: string): Promise<true | CommandError>
    {
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

        // Convert the doc to an action
        const action = await HistoryUtil.docToAction(dbObj);

        await action.undo(interaction, reason);
    }
}