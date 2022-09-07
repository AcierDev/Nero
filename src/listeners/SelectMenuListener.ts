import { Listener } from '@sapphire/framework';
import { Interaction } from 'discord.js';
import {ModActionUndoer} from "../moderation/ModActionUndoer";

export class InteractionCreateListener extends Listener
{
    public constructor(context: Listener.Context, options: Listener.Options)
    {
        super(context, {
            ...options,
            once: false,
            event: 'interactionCreate'
        });
    }

    public async run(interaction: Interaction)
    {
        // If the interaction was not a button
        if (! interaction.isSelectMenu()) return;

        await ModActionUndoer.handleSelectMenu(interaction);
    }
}