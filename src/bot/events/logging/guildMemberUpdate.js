const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        const logChannel = newMember.guild.channels.cache.find(ch => ch.name === 'server-logs');
        if (!logChannel) return;

        const changes = [];

        // Nickname change
        if (oldMember.nickname !== newMember.nickname) {
            changes.push({
                type: '📝 Nickname Changed',
                old: oldMember.nickname || 'None',
                new: newMember.nickname || 'None',
                gif: 'https://media.giphy.com/media/xT8qBit7YomT80d0M8/giphy.gif' // Name tag GIF
            });
        }

        // Role changes
        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

        addedRoles.forEach(role => {
            changes.push({
                type: '➕ Role Added',
                role: role.name,
                gif: 'https://media.giphy.com/media/3oEjHUf7j0aFDce0dG/giphy.gif' // Plus/add GIF
            });
        });

        removedRoles.forEach(role => {
            changes.push({
                type: '➖ Role Removed',
                role: role.name,
                gif: 'https://media.giphy.com/media/26tPnAAJxXTvpLwJy/giphy.gif' // Minus/remove GIF
            });
        });

        // Server mute/deafen
        if (oldMember.communicationDisabledUntil !== newMember.communicationDisabledUntil) {
            if (newMember.communicationDisabledUntil) {
                changes.push({
                    type: '🔇 Timed Out',
                    until: newMember.communicationDisabledUntil.toLocaleString(),
                    gif: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif' // Mute/shh GIF
                });
            } else {
                changes.push({
                    type: '🔊 Timeout Removed',
                    gif: 'https://media.giphy.com/media/3oEjHIbMq04S0TxT6U/giphy.gif' // Unmute GIF
                });
            }
        }

        if (changes.length === 0) return;

        // Fetch audit logs to see who made the changes
        let executor = null;
        try {
            const auditLogs = await newMember.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberUpdate,
                limit: 1
            });
            const auditEntry = auditLogs.entries.first();
            if (auditEntry && auditEntry.target.id === newMember.id) {
                executor = auditEntry.executor;
            }
        } catch (error) {
            console.error('[guildMemberUpdate] Error fetching audit logs:', error);
        }

        for (const change of changes) {
            const embed = new EmbedBuilder()
                .setColor(change.type.includes('Added') ? '#2ecc71' : change.type.includes('Removed') ? '#e74c3c' : '#f39c12')
                .setTitle(change.type)
                .setDescription(`Member update for ${newMember}`)
                .setThumbnail(change.gif || newMember.user.displayAvatarURL())
                .addFields({ name: 'User', value: `${newMember.user.tag}\n<@${newMember.id}>`, inline: true })
                .setTimestamp();

            if (change.old) embed.addFields({ name: 'Before', value: change.old, inline: true });
            if (change.new) embed.addFields({ name: 'After', value: change.new, inline: true });
            if (change.role) embed.addFields({ name: 'Role', value: change.role, inline: true });
            if (change.until) embed.addFields({ name: 'Until', value: change.until, inline: true });

            if (executor) {
                embed.setAuthor({
                    name: `Changed by ${executor.tag}`,
                    iconURL: executor.displayAvatarURL()
                });
                embed.setFooter({ text: `Executor ID: ${executor.id}` });
            }

            await logChannel.send({ embeds: [embed] });
        }
    }
};
