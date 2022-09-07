import {InteractionHandler, InteractionHandlerTypes, PieceContext} from '@sapphire/framework';
import type {SelectMenuInteraction} from 'discord.js';
import {DbManager} from "../db/DbManager";
import {ModerationAction} from "../moderation/ModerationAction";
import {DurationModerationAction} from "../moderation/DurationModerationAction";
import {HistoryUtil} from "../util/HistoryUtil";
import {GuildMember, MessageEmbed} from "discord.js";
import {checkMemberHasPerm} from "../util/utilFunctions";

export class UndoMenuHandler extends InteractionHandler
{
    public constructor(ctx: PieceContext, options: InteractionHandler.Options)
    {
        super(ctx, {
            ...options,
            interactionHandlerType: InteractionHandlerTypes.SelectMenu
        });
    }

    public override parse(interaction: SelectMenuInteraction)
    {
        if (interaction.customId !== 'remove_menu') return this.none();
        return this.some();
    }

    public async run(interaction: SelectMenuInteraction)
    {
        if (! (interaction.member instanceof GuildMember)) return;

        // Check that the member is an administrator
        const permissionError = await checkMemberHasPerm(interaction.member, "ADMINISTRATOR")

        // Get the id of the moderation action the user selected
        const selectedValue = interaction.values[0];

        // Fetch the action matching this id from the db
        const doc = await DbManager.fetchLog({_id: selectedValue});

        // If there is no action matching this id
        if (! doc)
        {
            // Send an error message
            await this.dbError(interaction);
            return;
        }

        const action: ModerationAction | DurationModerationAction = await HistoryUtil.docToAction(doc);


    }

    private async dbError(interaction: SelectMenuInteraction)
    {
        // Send an error message
        await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FF0000')
                    .setDescription(`<:database:1000894887429943327> Database error`)
            ],
            ephemeral: true
        })

        // Exit
        return;
    }
}