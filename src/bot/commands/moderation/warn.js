const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('⚠️ Warn a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the warning')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason');

        if (!target) {
            return await interaction.reply({ content: '❌ User not found.', ephemeral: true });
        }

        // Create embed
        const embed = new EmbedBuilder()
            .setColor('#F39C12')
            .setTitle('⚠️ User Warned')
            .addFields(
                { name: 'User', value: `${target.user.tag} (${target.id})`, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true },
                { name: 'Reason', value: reason, inline: false }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Log to mod-log
        const modLog = interaction.guild.channels.cache.find(ch => ch.name === 'moderation-logs');
        if (modLog) {
            await modLog.send({ embeds: [embed] });
        }

        // DM the user
        try {
            await target.send(`⚠️ You have been warned in **${interaction.guild.name}**\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`);
        } catch { } // Ignore if DMs closed
    }
};
