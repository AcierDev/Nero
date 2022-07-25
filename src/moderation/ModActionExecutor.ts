import {AbstractModerationAction} from "./actions/AbstractModerationAction";
import {PermCheckOptions} from "../util/command/interfaces/PermCheckOptions";
import {CommandUtil} from "../util/command/CommandUtil";
import {Command} from "@sapphire/framework";
import {AdditionalCheckOptions} from "../util/command/interfaces/AdditionalCheckOptions";
import {EmbedGenerator} from "../util/embeds/EmbedGenerator";

export class ModActionExecutor
{
    public static async execute(action: AbstractModerationAction, permChecks: PermCheckOptions, additionalChecks: AdditionalCheckOptions, successMsgFunc: () => string, interaction: Command.ChatInputInteraction)
    {
        // Perform all critical permission checks
        const commandPermissionError = await CommandUtil.performChecks(action, {
            permChecks: permChecks,
            additionalChecks: additionalChecks
        });
        // Handle a permission error, if any exists
        if (commandPermissionError)
        {
            // Send the user the error message
            await interaction.reply({
                embeds: [
                    EmbedGenerator.failureEmbed({
                        message: commandPermissionError.message,
                        emojiResolvable: commandPermissionError.emoji,
                        colorResolvable: commandPermissionError.color
                    })
                ], ephemeral: true
            });
            // Exit
            return;
        }

        // Attempt to execute the action in the guild
        const commandExecutionError = await action.execute();

        if (commandExecutionError)
        {
            await interaction.reply({
                embeds: [
                    EmbedGenerator.failureEmbed({
                        message: commandExecutionError.message,
                        emojiResolvable: commandExecutionError.emoji,
                        colorResolvable: commandExecutionError.color
                    })
                ],
                ephemeral: true
            })
        } else
        {
            await interaction.reply({
                embeds: [
                    EmbedGenerator.successEmbed({
                        emojiResolvable: '<a:ezgif:1000822167631577249>',
                        message: successMsgFunc()
                    })
                ],
                ephemeral: action.silent
            })
        }
    }
}