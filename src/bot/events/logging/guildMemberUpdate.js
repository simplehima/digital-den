const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        const logChannel = newMember.guild.channels.cache.find(ch => ch.name === 'member-logs');
        if (!logChannel) return;

        const changes = [];

        // Nickname change
        if (oldMember.nickname !== newMember.nickname) {
            changes.push({
                type: '📝 Nickname Changed',
                old: oldMember.nickname || 'None',
                new: newMember.nickname || 'None'
            });
        }

        // Role changes
        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

        addedRoles.forEach(role => {
            changes.push({ type: '➕ Role Added', role: role.name });
        });

        removedRoles.forEach(role => {
            changes.push({ type: '➖ Role Removed', role: role.name });
        });

        // Server mute/deafen
        if (oldMember.communicationDisabledUntil !== newMember.communicationDisabledUntil) {
            if (newMember.communicationDisabledUntil) {
                changes.push({ type: '🔇 Timed Out', until: newMember.communicationDisabledUntil.toLocaleString() });
            } else {
                changes.push({ type: '🔊 Timeout Removed' });
            }
        }

        if (changes.length === 0) return;

        for (const change of changes) {
            const embed = new EmbedBuilder()
                .setColor(change.type.includes('Added') || change.type.includes('Removed') ? '#3498db' : '#f39c12')
                .setTitle(change.type)
                .setThumbnail(newMember.user.displayAvatarURL())
                .addFields({ name: 'User', value: `${newMember.user.tag}\n<@${newMember.id}>`, inline: true })
                .setTimestamp();

            if (change.old) embed.addFields({ name: 'Before', value: change.old, inline: true });
            if (change.new) embed.addFields({ name: 'After', value: change.new, inline: true });
            if (change.role) embed.addFields({ name: 'Role', value: change.role, inline: true });
            if (change.until) embed.addFields({ name: 'Until', value: change.until, inline: true });

            await logChannel.send({ embeds: [embed] });
        }
    }
};
