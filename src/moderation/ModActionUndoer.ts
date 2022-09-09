import {
    MessageActionRow,
    MessageComponentInteraction,
    Modal, ModalSubmitInteraction,
    SelectMenuInteraction,
    TextInputComponent,
    TextInputStyleResolvable
} from "discord.js";
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
            .then(async modal => {

                await modal.deferReply()

                // Get the reason that the user entered
                const reason = modal.fields.getTextInputValue('reason')

                // Get the moderation action id that was selected
                const id = selectMenuInteraction.values[0];

                // Pass data off to method that will look up and undo the action that was selected
                await this.undoActionId(id, modal as any, reason)

            }).catch(err => console.error(err))
    }

    private static async undoActionId(id: string, interaction: ModalSubmitInteraction, reason: string): Promise<true | CommandError>
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

        // Begin execution of an undoing action
        await action.undo(interaction, reason);
    }
}