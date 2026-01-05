const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'roleDelete',
    async execute(role) {
        const logChannel = role.guild.channels.cache.find(ch => ch.name === 'server-logs');
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('🎭 Role Deleted')
            .addFields(
                { name: 'Name', value: role.name, inline: true },
                { name: 'Color', value: role.hexColor, inline: true },
                { name: 'ID', value: role.id, inline: true }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    }
};
