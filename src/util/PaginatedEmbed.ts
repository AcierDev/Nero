import {
    EmbedField, InteractionReplyOptions,
    Message,
    MessageActionRow,
    MessageButton, MessageEditOptions,
    MessageEmbed,
    MessageEmbedOptions,
} from "discord.js";

export class PaginatedEmbed
{
    // -------------------------------------------- //
    // STATIC
    // -------------------------------------------- //

    // Default maximum amount of fields allowed per page
    private static readonly DEFAULT_MAX_FIELDS = 25;

    // -------------------------------------------- //
    // FIELDS
    // -------------------------------------------- //

    // maximum amount of fields per page
    private readonly maxFields: number;
    // array of embed objects to be displayed
    private readonly pages: MessageEmbed[];
    // current page
    private currPage: number;
    // global embed fields
    private readonly embedOptions: MessageEmbedOptions;

    // -------------------------------------------- //
    // CONSTRUCTOR
    // -------------------------------------------- //

    constructor(options: { maxFields?: number, embedOptions?: MessageEmbedOptions })
    {
        this.maxFields = options.maxFields || PaginatedEmbed.DEFAULT_MAX_FIELDS;
        this.pages = []
        this.currPage = 0;
        this.embedOptions = options.embedOptions || null;
    }

    // -------------------------------------------- //
    // MEMBER FUNCTIONS
    // -------------------------------------------- //

    public addField(field: EmbedField): this
    {
        // For every page
        for (const embed of this.pages)
        {
            // If there is room in the page
            if (embed.fields.length < this.maxFields)
            {
                // Insert the field
                embed.addField(field.name, field.value, field.inline);
                // Return this for method chaining
                return this;
            }
        }

        // Else if there was no room in a page, create a new page
        this.createPage();
        // Recurse
        this.addField(field)
    }

    private createPage()
    {
        this.pages.push(new MessageEmbed(this.embedOptions));
    }

    public getMessage()
    {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('prev_button')
                    .setLabel('previous')
                    .setStyle('PRIMARY')
                    .setDisabled(this.currPage == 0),
                new MessageButton()
                    .setCustomId('next_button')
                    .setLabel('next')
                    .setStyle('PRIMARY')
                    .setDisabled(this.currPage == this.pages.length - 1)
            )

        return {
            embeds: [this.pages[this.currPage]],
            components: [row],
            fetchReply: true,
        }
    }

    public createCollector(message: Message)
    {
        const collector = message.createMessageComponentCollector({componentType: "BUTTON", time: 60 * 1000});

        collector.on('collect', async btnInteraction =>
        {
            await btnInteraction.deferUpdate();

            if (btnInteraction.customId == 'next_button')
            {
                ++this.currPage;
                await btnInteraction.editReply(this.getMessage())
            } else if (btnInteraction.customId == 'prev_button')
            {
                --this.currPage;
                await btnInteraction.editReply(this.getMessage());
            }
        })

        collector.on('end', async collected =>
        {
            await message.edit({components: null})
        })
    }
}