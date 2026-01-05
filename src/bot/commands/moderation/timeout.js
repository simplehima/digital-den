const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('⏰ Timeout a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration in minutes')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320)) // Max 28 days
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false)),

    async execute(interaction) {
        const target = interaction.options.getMember('user');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) {
            return await interaction.reply({ content: '❌ User not found in server.', ephemeral: true });
        }

        try {
            const durationMs = duration * 60 * 1000;
            await target.timeout(durationMs, `${reason} | Moderator: ${interaction.user.tag}`);

            const embed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setTitle('⏰ User Timed Out')
                .addFields(
                    { name: 'User', value: `${target.user.tag} (${target.id})`, inline: true },
                    { name: 'Duration', value: `${duration} minutes`, inline: true },
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
                content: '❌ Failed to timeout user.',
                ephemeral: true
            });
        }
    }
};
