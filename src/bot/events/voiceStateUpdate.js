const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        // Find logs channel
        const logChannel = newState.guild.channels.cache.find(ch => ch.name === 'voice-logs');
        if (!logChannel) return;

        const member = newState.member;
        let embed;

        // User joined a voice channel
        if (!oldState.channel && newState.channel) {
            embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('🔊 Voice Channel Join')
                .addFields(
                    { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
                    { name: 'Channel', value: `${newState.channel.name}`, inline: true }
                )
                .setTimestamp();
        }
        // User left a voice channel
        else if (oldState.channel && !newState.channel) {
            embed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('🔇 Voice Channel Leave')
                .addFields(
                    { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
                    { name: 'Channel', value: `${oldState.channel.name}`, inline: true }
                )
                .setTimestamp();
        }
        // User switched channels
        else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
            embed = new EmbedBuilder()
                .setColor('#3498DB')
                .setTitle('🔄 Voice Channel Switch')
                .addFields(
                    { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
                    { name: 'From', value: `${oldState.channel.name}`, inline: true },
                    { name: 'To', value: `${newState.channel.name}`, inline: true }
                )
                .setTimestamp();
        }

        if (embed) {
            await logChannel.send({ embeds: [embed] });
        }
    }
};
