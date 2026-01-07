const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: 'roleCreate',
    async execute(role) {
        const logChannel = role.guild.channels.cache.find(ch => ch.name === 'server-logs');
        if (!logChannel) return;

        // Fetch audit logs to see who created the role
        let executor = null;
        try {
            const auditLogs = await role.guild.fetchAuditLogs({
                type: AuditLogEvent.RoleCreate,
                limit: 1
            });
            const auditEntry = auditLogs.entries.first();
            if (auditEntry && auditEntry.target.id === role.id) {
                executor = auditEntry.executor;
            }
        } catch (error) {
            console.error('[roleCreate] Error fetching audit logs:', error);
        }

        const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('🎭 Role Created')
            .setDescription(`A new role has been created`)
            .addFields(
                { name: 'Role Name', value: role.name, inline: true },
                { name: 'Color', value: role.hexColor || 'None', inline: true },
                { name: 'ID', value: `\`${role.id}\``, inline: true },
                { name: 'Mentionable', value: role.mentionable ? '✅ Yes' : '❌ No', inline: true },
                { name: 'Hoisted', value: role.hoist ? '✅ Yes' : '❌ No', inline: true },
                { name: 'Position', value: `${role.position}`, inline: true }
            )
            .setThumbnail('https://media.giphy.com/media/l0HlNaQ6gWfllcjDO/giphy.gif') // Party GIF
            .setTimestamp();

        if (executor) {
            embed.setAuthor({
                name: `Created by ${executor.tag}`,
                iconURL: executor.displayAvatarURL()
            });
            embed.setFooter({ text: `Executor ID: ${executor.id}` });
        }

        await logChannel.send({ embeds: [embed] });
    }
};
