const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'roleUpdate',
    async execute(oldRole, newRole) {
        const logChannel = newRole.guild.channels.cache.find(ch => ch.name === 'server-logs');
        if (!logChannel) return;

        const changes = [];

        if (oldRole.name !== newRole.name) {
            changes.push({ field: 'Name', old: oldRole.name, new: newRole.name });
        }
        if (oldRole.hexColor !== newRole.hexColor) {
            changes.push({ field: 'Color', old: oldRole.hexColor, new: newRole.hexColor });
        }
        if (oldRole.hoist !== newRole.hoist) {
            changes.push({ field: 'Hoisted', old: oldRole.hoist ? 'Yes' : 'No', new: newRole.hoist ? 'Yes' : 'No' });
        }
        if (oldRole.mentionable !== newRole.mentionable) {
            changes.push({ field: 'Mentionable', old: oldRole.mentionable ? 'Yes' : 'No', new: newRole.mentionable ? 'Yes' : 'No' });
        }
        if (oldRole.position !== newRole.position) {
            changes.push({ field: 'Position', old: `${oldRole.position}`, new: `${newRole.position}` });
        }

        // Check permission changes
        const oldPerms = oldRole.permissions.toArray();
        const newPerms = newRole.permissions.toArray();
        const addedPerms = newPerms.filter(p => !oldPerms.includes(p));
        const removedPerms = oldPerms.filter(p => !newPerms.includes(p));

        if (addedPerms.length > 0 || removedPerms.length > 0) {
            let permChanges = '';
            if (addedPerms.length > 0) permChanges += `**Added:** ${addedPerms.join(', ')}\n`;
            if (removedPerms.length > 0) permChanges += `**Removed:** ${removedPerms.join(', ')}`;
            if (permChanges) {
                changes.push({ field: 'Permissions', old: '', new: permChanges });
            }
        }

        if (changes.length === 0) return;

        // Fetch audit logs to see who updated the role
        let executor = null;
        try {
            const auditLogs = await newRole.guild.fetchAuditLogs({
                type: AuditLogEvent.RoleUpdate,
                limit: 1
            });
            const auditEntry = auditLogs.entries.first();
            if (auditEntry && auditEntry.target.id === newRole.id) {
                executor = auditEntry.executor;
            }
        } catch (error) {
            console.error('[roleUpdate] Error fetching audit logs:', error);
        }

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🎭 Role Updated')
            .setDescription(`Role **${newRole.name}** has been modified`)
            .addFields({ name: 'Role', value: `${newRole} (${newRole.id})`, inline: false })
            .setThumbnail('https://media.giphy.com/media/3o7TKSx0g7RqRniGFG/giphy.gif') // Edit GIF
            .setTimestamp();

        changes.forEach(change => {
            if (change.field === 'Permissions') {
                embed.addFields({ name: change.field, value: change.new || 'None', inline: false });
            } else {
                embed.addFields({
                    name: change.field,
                    value: `${change.old} → ${change.new}`,
                    inline: true
                });
            }
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
