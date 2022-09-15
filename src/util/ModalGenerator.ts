import {MessageActionRow, Modal, TextInputComponent, TextInputStyleResolvable} from "discord.js";
import {TextInputStyle} from "discord-api-types/v9";
import {ModerationAction} from "../moderation/ModerationAction";
import {DurationModerationAction} from "../moderation/DurationModerationAction";

export class ModalGenerator
{
    public static genReasonModal(action: ModerationAction | DurationModerationAction)
    {
        let modal = new Modal()
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

        // if the action has
        if (action.undoRequiresDuration)
        {
            modal.addComponents(
                new MessageActionRow<TextInputComponent>()
                    .addComponents(
                        new TextInputComponent()
                            .setCustomId('duration')
                            .setLabel('Please enter a duration. Examples: 10m, 30s')
                            .setStyle(TextInputStyle.Short as unknown as TextInputStyleResolvable)
                            .setRequired(true)
                ))
        }

        return modal;
    }
}