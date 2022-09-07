import {ModerationAction} from "../ModerationAction";
import {Guild, MessageEmbed, SelectMenuInteraction, TextBasedChannel, User} from "discord.js";
import {Command} from "@sapphire/framework";
import {Unban} from "./Unban";
import {Mute} from "./Mute";

export class Unmute extends ModerationAction
{
    // -------------------------------------------- //
    // STATIC FACTORIES
    // -------------------------------------------- //
    public static async interactionFactory(interaction: Command.ChatInputInteraction): Promise<Unmute>
    {
        // get the command arguments
        const target = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason', true);
        const silent = interaction.options.getBoolean('silent', false) ?? false;

        // Create and return a new object
        return new Unmute(
            target,
            reason,
            interaction.user,
            Date.now(),
            interaction.guild,
            interaction.channel,
            silent,
            {}
        );
    }

    // -------------------------------------------- //
    // CONSTRUCT
    // -------------------------------------------- //
    constructor(target: User, reason: string, issuer: User, timestamp: number, guild: Guild, channel: TextBasedChannel, silent: boolean, options: { id?: string, type?: string }) {
        super(target, reason, issuer, timestamp, guild, channel, silent, options);

        // Set the required permission checks that need to be executed before this action runs
        this.executionChecks = {checkTargetIsBelowIssuer: true, checkTargetIsBelowClient: true, checkTargetIsInGuild: true, checkTargetMuted: true, checkIssuerHasPerm: "MUTE_MEMBERS"};

        // Set the success message that will be shown to the command executor after the command runs successfully
        this.successMsgFunc = () => `${this.target} unmuted`
    }

    // -------------------------------------------- //
    // OVERRIDES
    // -------------------------------------------- //
    override toMessageEmbed(): MessageEmbed
    {
        return new MessageEmbed()
            .setTitle('You were unmuted')
            .setColor('#FF3131')
            .setThumbnail(this.guild.iconURL())
            .setDescription(`${this.target} you have been **unmuted** from **${this.guild.name}**`)
            .addField(`Reason`, `\`\`\`${this.reason}\`\`\``)
            .setFooter({text: `${this.guild.name}`, iconURL: this.guild.iconURL()})
    }

    override async execute(): Promise<boolean>
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

    override genUndoAction(interaction: SelectMenuInteraction, reason: string, duration) {
        return new Mute(this.target, reason, interaction.user, Date.now(), this.guild, interaction.channel, interaction.ephemeral, duration, {})
    }
}