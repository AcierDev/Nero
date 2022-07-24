import {AbstractModerationAction} from "./abstract/AbstractModerationAction";
import {PermCheckOptions} from "../util/command/interfaces/PermCheckOptions";
import {CommandUtil} from "../util/command/CommandUtil";
import {Command} from "@sapphire/framework";
import {AdditionalCheckOptions} from "../util/command/interfaces/AdditionalCheckOptions";

export class ModActionExecutor
{
    public static async execute(action: AbstractModerationAction, permChecks: PermCheckOptions, additionalChecks: AdditionalCheckOptions, successMsgFunc: () => string, interaction: Command.ChatInputInteraction)
    {
        // Perform all critical permission checks
        const commandPermissionError = await CommandUtil.performChecks(action, {permChecks: permChecks, additionalChecks: additionalChecks});
        // Handle a permission error, if any exists
        if (commandPermissionError)
        {
            // Send the user the error message
            await interaction.reply({content: commandPermissionError.message, ephemeral: true});
            // Exit
            return;
        }

        // Attempt to execute the action in the guild
        const commandExecutionError = await action.execute();

        if (commandExecutionError)
        {
            await interaction.reply({
                content: commandExecutionError.message,
                ephemeral: true
            })
        }
        else
        {
            await interaction.reply({
                content: successMsgFunc(),
                ephemeral: action.silent
            })
        }
    }
}