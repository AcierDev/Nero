import {AbstractModerationAction} from "../abstract/AbstractModerationAction";
import {MessageEmbed} from "discord.js";
import {Command} from "@sapphire/framework";
import {ModActionDbObj} from "../../db/types/ModActionDbObj";

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
        const silent = interaction.options.getBoolean('silent', false) ?? false;

        // Create and return a new object
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
    // METHODS
    // -------------------------------------------- //
    override genEmbed(): MessageEmbed
    {
        return new MessageEmbed()
            .setTitle('You were warned!')
            .setColor('#FF3131')
            .setThumbnail(this.guild.iconURL({format: 'png'}))
            .setDescription(`${this.target} you have received a **warning** from **${this.guild.name}**`)
            .addField(`Reason`, `\`\`\`${this.reason}\`\`\``)
            .setFooter({text: `${this.guild.name}`, iconURL: this.guild.iconURL()})
        //TODO include guild invite link
    }

    override async perform(): Promise<boolean>
    {
        // Warnings don't actually do anything, so just indicate success
        return true;
    }

    /**
     * Generate a db object
     */
    public toDbObj(): ModActionDbObj
    {
        return new ModActionDbObj(
            "Warning",
            this.reason,
            this.issuer.id,
            this.target.id,
            this.guild.id,
            this.channel.id,
            this.silent,
            this.timestamp,
        )
    }

}