import { Collector, ColorResolvable, CommandInteraction, Message, MessageActionRow, MessageAttachment, MessageButton, MessageEmbed, MessageEmbedAuthor, MessageEmbedFooter, MessageEmbedThumbnail } from "discord.js";

export class OldPaginatedEmbed
{
    private DEFAULT_MAX_ALLOWABLE_FIELDS_PER_PAGE = 25;
    private pages: MessageEmbed[] = [];
    private maxAllowableFieldsPerPage: number;
    private author?: MessageEmbedAuthor;
    private title?: string;
    private color?: ColorResolvable;
    private description: string;
    private footer: MessageEmbedFooter;
    private thumbnailUrl: string;
    private current: number;


    constructor(options: { maxAllowableFieldsPerPage?: number }) {
        this.pages[0] = new MessageEmbed(); // create a first empty embed
        this.current = 0;
        this.maxAllowableFieldsPerPage = options.maxAllowableFieldsPerPage || this.DEFAULT_MAX_ALLOWABLE_FIELDS_PER_PAGE;
    }

    public addField(name: string, value: string, inline?: boolean): this {

        /**
         * if there is still room in one of the current pages then add this field
         */
        for (const embed of this.pages) {
            if (embed.fields.length < this.maxAllowableFieldsPerPage) {
                embed.addField(name, value, inline);
                return this;
            }
        }

        /**
         * if execution reaches here then there is no room in the currently existing pages
         * we must create a new page and then store the field in that page
         */
        let embed = new MessageEmbed()
            .addField(name, value, inline)

        /* populate this embed with the global fields */
        if (this.title) embed.setTitle(this.title)
        if (this.author) embed.setAuthor(this.author)
        if (this.color) embed.setColor(this.color)
        if (this.description) embed.setDescription(this.description)
        if (this.footer) embed.setFooter(this.footer)
        if (this.thumbnailUrl) embed.setThumbnail(this.thumbnailUrl)

        this.pages.push(embed)

        console.log('pages length', this.pages.length)

        return this;
    }

    public createPage(): this {
        let embed = new MessageEmbed()

        /* populate this embed with the global fields */
        if (this.title) embed.setTitle(this.title)
        if (this.author) embed.setAuthor(this.author)
        if (this.color) embed.setColor(this.color)
        if (this.description) embed.setDescription(this.description)
        if (this.footer) embed.setFooter(this.footer)
        if (this.thumbnailUrl) embed.setThumbnail(this.thumbnailUrl)

        this.pages.push(embed)

        console.log('pages length', this.pages.length)

        return this;
    }

    public setAllAuthor(author: MessageEmbedAuthor): this {
        this.author = author;

        for (const embed of this.pages) {
            embed.setAuthor(author);
        }

        return this;
    }

    public setAllTitle(title: string): this {
        this.title = title;

        for (const embed of this.pages) {
            embed.setTitle(title);
        }

        return this;
    }

    public setAllColor(color: ColorResolvable): this {
        this.color = color;

        for (const embed of this.pages) {
            embed.setColor(color);
        }

        return this;
    }

    public setAllDescription(description: string): this {
        this.description = description;

        for (const embed of this.pages) {
            embed.setDescription(description);
        }

        return this;
    }


    public setAllFooter(footer?: MessageEmbedFooter): this {
        this.footer = footer;

        for (let i = 0; i < this.pages.length; i++) {
            this.pages[i].setFooter({
                text: `page ${i + 1} / ${this.pages.length}
            ${this.footer ?? ''}`
            })
        }

        return this;
    }

    public setAllThumbnail(url: string): this {
        this.thumbnailUrl = url;

        for (const embed of this.pages) {
            embed.setThumbnail(url)
        }

        return this;
    }

    public setAuthor(author: MessageEmbedAuthor, embedNum: number): this {
        if (this.pages.length <= embedNum) console.error('There does not exist a page at that index');
        else {
            this.pages[embedNum].setAuthor(author);
            return this;
        }
    }

    public setTitle(title: string, embedNum: number): this {
        if (this.pages.length <= embedNum) console.error('There does not exist a page at that index');
        else {
            this.pages[embedNum].setTitle(title);
            return this;
        }
    }

    public setColor(color: ColorResolvable, embedNum: number): this {
        if (this.pages.length <= embedNum) console.error('There does not exist a page at that index');
        else {
            this.pages[embedNum].setColor(color);
            return this;
        }
    }

    public setDescription(description: string, embedNum: number): this {
        if (this.pages.length <= embedNum) console.error('There does not exist a page at that index');
        else {
            this.pages[embedNum].setDescription(description);
            return this;
        }
    }

    public setFooter(footer: MessageEmbedFooter, embedNum: number): this {
        if (this.pages.length <= embedNum) console.error('There does not exist a page at that index');
        else {
            this.pages[embedNum].setFooter(footer);
            return this;
        }
    }

    public setImage(url: string, embedNum: number): this {
        if (this.pages.length <= embedNum) console.error('There does not exist a page at that index');
        else {
            this.pages[embedNum].setImage(url);
            return this;
        }
    }

    public setThumbnail(url: string, embedNum: number): this {
        if (this.pages.length <= embedNum) console.error('There does not exist a page at that index');
        else {
            this.pages[embedNum].setThumbnail(url);
            return this;
        }
    }

    public getLength() {
        return this.pages.length;
    }

    private getMsg(options: { attachments?: MessageAttachment[] }) {
        let prevButton = new MessageButton()
            .setCustomId('prev_button')
            .setLabel('previous')
            .setStyle('PRIMARY')
            .setDisabled(this.current == 0)

        let nextButton = new MessageButton()
            .setCustomId('next_button')
            .setLabel('next')
            .setStyle('PRIMARY')
            .setDisabled(this.current == this.pages.length - 1)

        let row = new MessageActionRow()
            .addComponents([prevButton, nextButton])

        let embed = this.pages[this.current];

        let msgObj = {
            embeds: [embed],
            components: [row]
        }

        if (options.attachments) {
            (msgObj as any).files = options.attachments;
        }

        return msgObj;
    }

    public async send(options: { message?: Message, interaction?: CommandInteraction, attachments?: MessageAttachment[] }) {
        if (!(options.message || options.interaction)) {
            console.error('Neither a message or interaction was passed');
        }

        let msgObj = this.getMsg({ attachments: options.attachments });

        let sent: Message;

        if (options.message) {
            sent = await options.message.reply(msgObj)
        } else if (options.interaction) {
            if (!options.interaction.deferred) await options.interaction.deferReply();
            sent = await options.interaction.followUp(msgObj) as Message
        }

        let collector = sent.createMessageComponentCollector({ componentType: 'BUTTON', time: 24 * 60 * 60 * 1000 });

        collector.on('collect', buttonInt => {
            if (!buttonInt) return;

            buttonInt.deferUpdate();

            console.log(`${buttonInt.customId} clicked by ${buttonInt.user.tag}`)
            if (buttonInt.customId == 'next_button') {
                ++this.current;
                (buttonInt.message as Message).edit(this.getMsg({}))
            } else if (buttonInt.customId == 'prev_button') {
                --this.current;
                (buttonInt.message as Message).edit(this.getMsg({}))
            }
        })

        collector.on('end', collected => {
            sent.edit({ embeds: [new MessageEmbed().setDescription('This message expired').setColor('YELLOW')] });
        })
    }


}
