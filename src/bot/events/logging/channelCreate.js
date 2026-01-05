const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'channelCreate',
    async execute(channel) {
        if (!channel.guild) return;

        const logChannel = channel.guild.channels.cache.find(ch => ch.name === 'server-logs');
        if (!logChannel) return;

        const typeNames = {
            0: '💬 Text',
            2: '🔊 Voice',
            4: '📁 Category',
            5: '📢 Announcement',
            13: '🎭 Stage',
            15: '💬 Forum'
        };

        const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('📁 Channel Created')
            .addFields(
                { name: 'Name', value: channel.name, inline: true },
                { name: 'Type', value: typeNames[channel.type] || 'Unknown', inline: true },
                { name: 'Category', value: channel.parent?.name || 'None', inline: true }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    }
};
