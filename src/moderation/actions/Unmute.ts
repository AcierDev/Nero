import {AbstractModerationAction} from "../abstract/AbstractModerationAction";
import {MessageEmbed} from "discord.js";
import {Command} from "@sapphire/framework";
import {DbTypes} from "../../db/types/DbTypes";
import ModActionDbObj = DbTypes.ModActionDbObj;

export class Unmute extends AbstractModerationAction
{
    // -------------------------------------------- //
    // STATIC FACTORY
    // -------------------------------------------- //

    /**
     *
     * @param interaction
     */
    public static interactionFactory(interaction: Command.ChatInputInteraction)
    {
        // Get the command arguments
        const target = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason', true);
        const silent = interaction.options.getBoolean('silent', false) ?? false;

        // Construct and return an UnMute instance
        return new Unmute(
            target,
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
            .setTitle('You were unmuted!')
            .setColor('#FF3131')
            .setThumbnail(this.guild.iconURL())
            .setDescription(`${this.target} you have been **unmuted** from **${this.guild.name}**`)
            .addField(`Reason`, `\`\`\`${this.reason}\`\`\``)
            .setFooter({text: `${this.guild.name}`, iconURL: this.guild.iconURL()})
    }

    override async perform(): Promise<boolean>
    {
        try
        {
            // Attempt to find the user in the server
            const member = (await this.guild.members.fetch()).find(member => member.id == this.target.id)
            // If the member isn't found, indicate a failure. This should be an unreachable state
            if (!member)
                return false;
            // Attempt to set the user's time out to null via the API
            await member.timeout(null, this.reason);
            // Indicate success
            return true;
        } catch (e)
        {
            // Stack trace
            console.log(e)
            // Indicate a failure
            return false;
        }
    }

    /**
     * Generate a db object
     */
    public toDbObj(): ModActionDbObj
    {
        return new ModActionDbObj(
            "Unmute",
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