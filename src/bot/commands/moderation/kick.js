const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('👢 Kick a user from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false)),

    async execute(interaction) {
        const target = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) {
            return await interaction.reply({ content: '❌ User not found in server.', ephemeral: true });
        }

        try {
            await target.kick(`${reason} | Moderator: ${interaction.user.tag}`);

            const embed = new EmbedBuilder()
                .setColor('#F39C12')
                .setTitle('👢 User Kicked')
                .addFields(
                    { name: 'User', value: `${target.user.tag} (${target.id})`, inline: true },
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
                content: '❌ Failed to kick user.',
                ephemeral: true
            });
        }
    }
};
