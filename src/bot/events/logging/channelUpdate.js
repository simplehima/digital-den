const { EmbedBuilder, AuditLogEvent, ChannelType } = require('discord.js');

module.exports = {
    name: 'channelUpdate',
    async execute(oldChannel, newChannel) {
        if (!newChannel.guild) return; // DM channels

        const logChannel = newChannel.guild.channels.cache.find(ch => ch.name === 'server-logs');
        if (!logChannel) return;

        const changes = [];

        // Name change
        if (oldChannel.name !== newChannel.name) {
            changes.push({ field: 'Name', old: oldChannel.name, new: newChannel.name });
        }

        // Topic change (text channels)
        if (oldChannel.topic !== newChannel.topic) {
            changes.push({
                field: 'Topic',
                old: oldChannel.topic || 'None',
                new: newChannel.topic || 'None'
            });
        }

        // NSFW change
        if (oldChannel.nsfw !== newChannel.nsfw) {
            changes.push({
                field: 'NSFW',
                old: oldChannel.nsfw ? 'Yes' : 'No',
                new: newChannel.nsfw ? 'Yes' : 'No'
            });
        }

        // Slowmode change
        if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
            changes.push({
                field: 'Slowmode',
                old: oldChannel.rateLimitPerUser ? `${oldChannel.rateLimitPerUser}s` : 'Off',
                new: newChannel.rateLimitPerUser ? `${newChannel.rateLimitPerUser}s` : 'Off'
            });
        }

        // Bitrate change (voice channels)
        if (oldChannel.bitrate !== newChannel.bitrate) {
            changes.push({
                field: 'Bitrate',
                old: `${oldChannel.bitrate / 1000}kbps`,
                new: `${newChannel.bitrate / 1000}kbps`
            });
        }

        // User limit change (voice channels)
        if (oldChannel.userLimit !== newChannel.userLimit) {
            changes.push({
                field: 'User Limit',
                old: oldChannel.userLimit === 0 ? 'Unlimited' : `${oldChannel.userLimit}`,
                new: newChannel.userLimit === 0 ? 'Unlimited' : `${newChannel.userLimit}`
            });
        }

        // Category change
        if (oldChannel.parentId !== newChannel.parentId) {
            changes.push({
                field: 'Category',
                old: oldChannel.parent?.name || 'None',
                new: newChannel.parent?.name || 'None'
            });
        }

        // Position change
        if (oldChannel.position !== newChannel.position) {
            changes.push({
                field: 'Position',
                old: `${oldChannel.position}`,
                new: `${newChannel.position}`
            });
        }

        if (changes.length === 0) return;

        // Fetch audit logs to see who updated the channel
        let executor = null;
        try {
            const auditLogs = await newChannel.guild.fetchAuditLogs({
                type: AuditLogEvent.ChannelUpdate,
                limit: 1
            });
            const auditEntry = auditLogs.entries.first();
            if (auditEntry && auditEntry.target.id === newChannel.id) {
                executor = auditEntry.executor;
            }
        } catch (error) {
            console.error('[channelUpdate] Error fetching audit logs:', error);
        }

        const typeEmojis = {
            [ChannelType.GuildText]: '💬',
            [ChannelType.GuildVoice]: '🔊',
            [ChannelType.GuildCategory]: '📁',
            [ChannelType.GuildAnnouncement]: '📢',
            [ChannelType.GuildStageVoice]: '🎭',
            [ChannelType.GuildForum]: '💬'
        };

        const emoji = typeEmojis[newChannel.type] || '📝';

        const embed = new EmbedBuilder()
            .setColor('#f39c12')
            .setTitle(`${emoji} Channel Updated`)
            .setDescription(`Channel ${newChannel} has been modified`)
            .addFields({ name: 'Channel', value: `${newChannel.name}\n\`${newChannel.id}\``, inline: false })
            .setThumbnail('https://media.giphy.com/media/l46Cy1rHbQ92uuLXa/giphy.gif') // Settings/gear GIF
            .setTimestamp();

        changes.forEach(change => {
            embed.addFields({
                name: change.field,
                value: `${change.old} → ${change.new}`,
                inline: true
            });
        });

        if (executor) {
            embed.setAuthor({
                name: `Updated by ${executor.tag}`,
                iconURL: executor.displayAvatarURL()
            });
            embed.setFooter({ text: `Executor ID: ${executor.id}` });
        }

        await logChannel.send({ embeds: [embed] });
    }
};
