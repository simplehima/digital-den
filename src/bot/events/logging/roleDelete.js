const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'roleDelete',
    async execute(role) {
        const logChannel = role.guild.channels.cache.find(ch => ch.name === 'server-logs');
        if (!logChannel) return;

        // Fetch audit logs to see who deleted the role
        let executor = null;
        try {
            const auditLogs = await role.guild.fetchAuditLogs({
                type: AuditLogEvent.RoleDelete,
                limit: 1
            });
            const auditEntry = auditLogs.entries.first();
            if (auditEntry && auditEntry.target.id === role.id) {
                executor = auditEntry.executor;
            }
        } catch (error) {
            console.error('[roleDelete] Error fetching audit logs:', error);
        }

        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('🎭 Role Deleted')
            .setDescription(`A role has been deleted`)
            .addFields(
                { name: 'Role Name', value: role.name, inline: true },
                { name: 'Color', value: role.hexColor || 'None', inline: true },
                { name: 'ID', value: `\`${role.id}\``, inline: true }
            )
            .setThumbnail('https://media.giphy.com/media/26n6XC8EYdrzRniWQ/giphy.gif') // Delete/trash GIF
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
