const { EmbedBuilder, AuditLogEvent, ChannelType } = require('discord.js');

module.exports = {
    name: 'channelDelete',
    async execute(channel) {
        if (!channel.guild) return;

        const logChannel = channel.guild.channels.cache.find(ch => ch.name === 'server-logs');
        if (!logChannel) return;

        // Fetch audit logs to see who deleted the channel
        let executor = null;
        try {
            const auditLogs = await channel.guild.fetchAuditLogs({
                type: AuditLogEvent.ChannelDelete,
                limit: 1
            });
            const auditEntry = auditLogs.entries.first();
            if (auditEntry && auditEntry.target.id === channel.id) {
                executor = auditEntry.executor;
            }
        } catch (error) {
            console.error('[channelDelete] Error fetching audit logs:', error);
        }

        const typeNames = {
            [ChannelType.GuildText]: '💬 Text',
            [ChannelType.GuildVoice]: '🔊 Voice',
            [ChannelType.GuildCategory]: '📁 Category',
            [ChannelType.GuildAnnouncement]: '📢 Announcement',
            [ChannelType.GuildStageVoice]: '🎭 Stage',
            [ChannelType.GuildForum]: '💬 Forum'
        };

        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('🗑️ Channel Deleted')
            .setDescription(`A channel has been deleted`)
            .addFields(
                { name: 'Name', value: channel.name, inline: true },
                { name: 'Type', value: typeNames[channel.type] || 'Unknown', inline: true },
                { name: 'Category', value: channel.parent?.name || 'None', inline: true },
                { name: 'ID', value: `\`${channel.id}\``, inline: false }
            )
            .setThumbnail('https://media.giphy.com/media/3o6Mbbs879ozZ9Yic0/giphy.gif') // Trash/delete GIF
            .setTimestamp();

        if (executor) {
            embed.setAuthor({
                name: `Deleted by ${executor.tag}`,
                iconURL: executor.displayAvatarURL()
            });
            embed.setFooter({ text: `Executor ID: ${executor.id}` });
        }

        await logChannel.send({ embeds: [embed] });
    }
};
