const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('🔨 Ban a user from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('delete_messages')
                .setDescription('Delete messages from the last 7 days')
                .setRequired(false)),

    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const deleteMessages = interaction.options.getBoolean('delete_messages') || false;

        try {
            // Ban the user
            await interaction.guild.members.ban(target, {
                deleteMessageSeconds: deleteMessages ? 7 * 24 * 60 * 60 : 0,
                reason: `${reason} | Moderator: ${interaction.user.tag}`
            });

            // Create response embed
            const embed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('🔨 User Banned')
                .addFields(
                    { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Log to mod-log channel
            const modLog = interaction.guild.channels.cache.find(ch => ch.name === 'moderation-logs');
            if (modLog) {
                await modLog.send({ embeds: [embed] });
            }

            // TODO: Save to database with case ID

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to ban user. Make sure I have the necessary permissions.',
                ephemeral: true
            });
        }
    }
};
