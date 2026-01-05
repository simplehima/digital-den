const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'channelDelete',
    async execute(channel) {
        if (!channel.guild) return;

        const logChannel = channel.guild.channels.cache.find(ch => ch.name === 'server-logs');
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('📁 Channel Deleted')
            .addFields(
                { name: 'Name', value: channel.name, inline: true },
                { name: 'ID', value: channel.id, inline: true }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    }
};
