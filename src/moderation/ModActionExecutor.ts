import {ModerationAction} from "./ModerationAction";
import {CommandUtil} from "../util/CommandUtil";
import {MessageEmbed, ModalSubmitInteraction} from "discord.js";
import {Command} from "@sapphire/framework";

export class ModActionExecutor
{
    public static async execute(action: ModerationAction, interaction: Command.ChatInputInteraction | ModalSubmitInteraction)
    {
        // Perform all critical permission checks
        const commandError = await CommandUtil.commandChecks(action, action.executionChecks);

        // Handle a permission error, if any exists
        if (commandError)
        {
            // Send the user the error message
            await interaction.followUp({
                embeds: [commandError.toMessageEmbed()], ephemeral: action.silent
            });
            // Exit
            return;
        }

        // Attempt to execute the action in the guild
        const commandExecutionError = await action.run();

        if (commandExecutionError)
        {
            // Respond to user with nice error embed
            await interaction.followUp({
                embeds: [commandExecutionError.toMessageEmbed()],
                ephemeral: action.silent
            })
        } else
        {
            // Respond to user with nice success embed
            await interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setDescription('<a:ezgif:1000822167631577249>' + ' ' + action.successMsgFunc())
                        .setColor('#03FBAB')
                ],
                ephemeral: action.silent
            })
        }
    }
}