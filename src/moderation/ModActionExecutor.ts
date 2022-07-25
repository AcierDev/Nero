import {AbstractModerationAction} from "./actions/AbstractModerationAction";
import {PermCheckOptions} from "../util/command/interfaces/PermCheckOptions";
import {CommandUtil} from "../util/command/CommandUtil";
import {Command} from "@sapphire/framework";
import {AdditionalCheckOptions} from "../util/command/interfaces/AdditionalCheckOptions";
import {MessageEmbed} from "discord.js";

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
                embeds: [ commandPermissionError.toMessageEmbed() ], ephemeral: true
            });
            // Exit
            return;
        }

        // Attempt to execute the action in the guild
        const commandExecutionError = await action.run();

        if (commandExecutionError)
        {
            // Respond to user with nice error embed
            await interaction.reply({
                embeds: [ commandExecutionError.toMessageEmbed() ],
                ephemeral: true
            })
        } else
        {
            // Respond to user with nice success embed
            await interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription('<a:ezgif:1000822167631577249>' + ' ' + successMsgFunc())
                        .setColor('#03FBAB')
                ],
                ephemeral: action.silent
            })
        }
    }
}