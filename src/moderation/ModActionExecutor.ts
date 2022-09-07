import {ModerationAction} from "./ModerationAction";
import {CommandUtil} from "../util/CommandUtil";
import {Command} from "@sapphire/framework";
import {MessageEmbed, SelectMenuInteraction} from "discord.js";

export class ModActionExecutor
{
    public static async execute(action: ModerationAction, interaction: Command.ChatInputInteraction | SelectMenuInteraction)
    {
        // Perform all critical permission checks
        const commandError = await CommandUtil.commandChecks(action, action.executionChecks);

        // Handle a permission error, if any exists
        if (commandError)
        {
            // Send the user the error message
            await interaction.reply({
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
            await interaction.reply({
                embeds: [commandExecutionError.toMessageEmbed()],
                ephemeral: action.silent
            })
        } else
        {
            // Respond to user with nice success embed
            await interaction.reply({
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