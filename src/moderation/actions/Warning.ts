import {AbstractModerationAction} from "../abstract/AbstractModerationAction";
import {MessageEmbed} from "discord.js";
import {Command} from "@sapphire/framework";

export class Warning extends AbstractModerationAction
{
    // -------------------------------------------- //
    // STATIC FACTORIES
    // Static methods to return an instance of the class
    // because this shitty language doesn't have constructor overloading
    // -------------------------------------------- //

    /**
     * Generate an instance of a Warning from an interaction
     */
    public static async interactionFactory(interaction: Command.ChatInputInteraction)
    {
        // get the command arguments
        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason', true);
        const silent = interaction.options.getBoolean('silent') ?? false;

        return new Warning(
            user,
            reason,
            interaction.user,
            Date.now(),
            interaction.guild,
            interaction.channel,
            silent
        );
    }

    // -------------------------------------------- //
    // OVERRIDES
    // -------------------------------------------- //
    override genEmbed(): MessageEmbed
    {
        return new MessageEmbed()
            .setTitle('You were warned!')
            .setColor('#FF3131')
            .setThumbnail(this.guild.iconURL({format: 'png'}))
            .setDescription(`${this.target} you have received a **warning** from **${this.guild.name}**`)
            .addField(`Reason`, `\`\`\`${this.reason}\`\`\``)
            .setFooter({text: `${this.guild.name} staff team`, iconURL: this.guild.iconURL()})
        //TODO include guild invite link
    }

    override async perform(): Promise<boolean>
    {
        return Promise.resolve(true);
    }

    override async recordToDb(): Promise<boolean>
    {
        //TODO
        return Promise.resolve(true);
    }

}