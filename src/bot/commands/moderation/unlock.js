const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('🔓 Unlock a channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to unlock (defaults to current)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for unlocking')
                .setRequired(false)),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            await channel.permissionOverwrites.edit(interaction.guild.id, {
                SendMessages: null
            });

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('🔓 Channel Unlocked')
                .addFields(
                    { name: 'Channel', value: `<#${channel.id}>`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            const modLog = interaction.guild.channels.cache.find(ch => ch.name === 'moderation-logs');
            if (modLog) {
                await modLog.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to unlock channel.',
                ephemeral: true
            });
        }
    }
};
