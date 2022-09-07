import {ModerationAction} from "../ModerationAction";
import {Guild, MessageEmbed, SelectMenuInteraction, TextBasedChannel, User} from "discord.js";
import {Command} from "@sapphire/framework";

export class Warning extends ModerationAction
{
    // -------------------------------------------- //
    // STATIC FACTORIES
    // -------------------------------------------- //
    public static async interactionFactory(interaction: Command.ChatInputInteraction): Promise<Warning>
    {
        // get the command arguments
        const target = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason', true);
        const silent = interaction.options.getBoolean('silent', false) ?? false;

        // Create and return a new object
        return new Warning(
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
        this.executionChecks = { checkTargetIsBelowIssuer: true, checkIssuerHasPerm: "MUTE_MEMBERS", checkTargetIsInGuild: true};

        // Set the success message that will be shown to the command executor after the command runs successfully
        this.successMsgFunc = () => `${this.target} warned`
    }

    // -------------------------------------------- //
    // METHODS
    // -------------------------------------------- //
    override toMessageEmbed(): MessageEmbed
    {
        return new MessageEmbed()
            .setTitle('You were warned')
            .setColor('#FF3131')
            .setThumbnail(this.guild.iconURL({format: 'png'}))
            .setDescription(`${this.target} you have received a **warning** from **${this.guild.name}**`)
            .addField(`Reason`, `\`\`\`${this.reason}\`\`\``)
            .setFooter({text: `${this.guild.name}`, iconURL: this.guild.iconURL()})
        //TODO include guild invite link
    }

    override async execute(): Promise<boolean>
    {
        // Warnings don't actually do anything, so just indicate success
        return true;
    }

    genUndoAction(interaction: SelectMenuInteraction, reason: string, duration?: number) {
        return null;
    }
}