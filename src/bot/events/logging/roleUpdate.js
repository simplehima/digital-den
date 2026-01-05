const { EmbedBuilder } = require('discord.js');

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

        if (changes.length === 0) return;

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🎭 Role Updated')
            .addFields({ name: 'Role', value: newRole.name, inline: true });

        changes.forEach(change => {
            embed.addFields({ name: change.field, value: `${change.old} → ${change.new}`, inline: true });
        });

        embed.setTimestamp();
        await logChannel.send({ embeds: [embed] });
    }
};
