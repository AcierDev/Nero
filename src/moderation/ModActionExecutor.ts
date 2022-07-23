import {AbstractModerationAction} from "./abstract/AbstractModerationAction";
import {PermCheckOptions} from "../util/permissions/interfaces/PermCheckOptions";
import {PermissionUtil} from "../util/permissions/PermissionUtil";
import {Command} from "@sapphire/framework";

export class ModActionExecutor
{
    public static async execute(action: AbstractModerationAction, permChecks: PermCheckOptions, successMsgFunc: () => string, failureMsgFunc: () => string, interaction: Command.ChatInputInteraction)
    {
        // Perform all critical permission checks
        const error = await PermissionUtil.checkPermissions(action, permChecks);
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