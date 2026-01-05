const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('🗑️ Delete multiple messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Only delete messages from this user')
                .setRequired(false)),

    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const targetUser = interaction.options.getUser('user');

        await interaction.deferReply({ ephemeral: true });

        try {
            let messages = await interaction.channel.messages.fetch({ limit: amount + 1 });

            // Filter by user if specified
            if (targetUser) {
                messages = messages.filter(m => m.author.id === targetUser.id);
            }

            // Remove the command message
            messages = messages.filter(m => m.id !== interaction.id);

            // Bulk delete
            const deleted = await interaction.channel.bulkDelete(messages, true);

            await interaction.editReply({
                content: `✅ Deleted ${deleted.size} message(s).`
            });

            // Log to mod-log
            const modLog = interaction.guild.channels.cache.find(ch => ch.name === 'moderation-logs');
            if (modLog) {
                const embed = new EmbedBuilder()
                    .setColor('#3498DB')
                    .setTitle('🗑️ Messages Purged')
                    .addFields(
                        { name: 'Channel', value: `<#${interaction.channel.id}>`, inline: true },
                        { name: 'Amount', value: `${deleted.size}`, inline: true },
                        { name: 'Moderator', value: interaction.user.tag, inline: true }
                    )
                    .setTimestamp();

                if (targetUser) {
                    embed.addFields({ name: 'Target User', value: targetUser.tag });
                }

                await modLog.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: '❌ Failed to delete messages. Messages older than 14 days cannot be bulk deleted.'
            });
        }
    }
};
