import {AbstractModerationAction} from "./abstract/AbstractModerationAction";
import {PermCheckOptions} from "../util/command/interfaces/PermCheckOptions";
import {CommandUtil} from "../util/command/CommandUtil";
import {Command} from "@sapphire/framework";
import {AdditionalCheckOptions} from "../util/command/interfaces/AdditionalCheckOptions";

export class ModActionExecutor
{
    public static async execute(action: AbstractModerationAction, permChecks: PermCheckOptions, additionalChecks: AdditionalCheckOptions, successMsgFunc: () => string, failureMsgFunc: () => string, interaction: Command.ChatInputInteraction)
    {
        // Perform all critical permission checks
        const error = await CommandUtil.checkPermissions(action, permChecks);
        // Handle a permission error, if any exists
        if (error)
        {
            // Send the user the error message
            await interaction.reply({content: error.message, ephemeral: true});
            // Exit
            return;
        }

        // Attempt to execute the action in the guild
        const success: boolean = await action.execute()

        if (success)
        {
            await interaction.reply({
                content: successMsgFunc(),
                ephemeral: action.silent
            });
        } else
        {
            await interaction.reply({
                content: failureMsgFunc(),
                ephemeral: true
            })
        }
    }
}