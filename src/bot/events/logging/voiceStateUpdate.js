const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        const logChannel = newState.guild.channels.cache.find(ch => ch.name === 'voice-logs');
        if (!logChannel) return;

        const member = newState.member;
        let embed = null;

        // Joined voice
        if (!oldState.channel && newState.channel) {
            embed = new EmbedBuilder()
                .setColor('#2ecc71')
                .setTitle('🎙️ Joined Voice')
                .addFields(
                    { name: 'User', value: `${member.user.tag}`, inline: true },
                    { name: 'Channel', value: `🔊 ${newState.channel.name}`, inline: true }
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();
        }

        // Left voice
        else if (oldState.channel && !newState.channel) {
            embed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle('🚪 Left Voice')
                .addFields(
                    { name: 'User', value: `${member.user.tag}`, inline: true },
                    { name: 'Channel', value: `🔊 ${oldState.channel.name}`, inline: true }
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();
        }

        // Switched channels
        else if (oldState.channel && newState.channel && oldState.channelId !== newState.channelId) {
            embed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle('🔀 Switched Voice Channel')
                .addFields(
                    { name: 'User', value: `${member.user.tag}`, inline: true },
                    { name: 'From', value: `🔊 ${oldState.channel.name}`, inline: true },
                    { name: 'To', value: `🔊 ${newState.channel.name}`, inline: true }
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();
        }

        // Muted/Unmuted (server)
        else if (oldState.serverMute !== newState.serverMute) {
            embed = new EmbedBuilder()
                .setColor(newState.serverMute ? '#e74c3c' : '#2ecc71')
                .setTitle(newState.serverMute ? '🔇 Server Muted' : '🔊 Server Unmuted')
                .addFields(
                    { name: 'User', value: `${member.user.tag}`, inline: true },
                    { name: 'Channel', value: `🔊 ${newState.channel?.name || 'N/A'}`, inline: true }
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();
        }

        // Deafened/Undeafened (server)
        else if (oldState.serverDeaf !== newState.serverDeaf) {
            embed = new EmbedBuilder()
                .setColor(newState.serverDeaf ? '#e74c3c' : '#2ecc71')
                .setTitle(newState.serverDeaf ? '🔇 Server Deafened' : '🔊 Server Undeafened')
                .addFields(
                    { name: 'User', value: `${member.user.tag}`, inline: true },
                    { name: 'Channel', value: `🔊 ${newState.channel?.name || 'N/A'}`, inline: true }
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();
        }

        // Self mute
        else if (oldState.selfMute !== newState.selfMute) {
            embed = new EmbedBuilder()
                .setColor(newState.selfMute ? '#f39c12' : '#2ecc71')
                .setTitle(newState.selfMute ? '🔇 Self Muted' : '🔊 Self Unmuted')
                .addFields(
                    { name: 'User', value: `${member.user.tag}`, inline: true },
                    { name: 'Channel', value: `🔊 ${newState.channel?.name || 'N/A'}`, inline: true }
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();
        }

        // Self deafen
        else if (oldState.selfDeaf !== newState.selfDeaf) {
            embed = new EmbedBuilder()
                .setColor(newState.selfDeaf ? '#f39c12' : '#2ecc71')
                .setTitle(newState.selfDeaf ? '🔇 Self Deafened' : '🔊 Self Undeafened')
                .addFields(
                    { name: 'User', value: `${member.user.tag}`, inline: true },
                    { name: 'Channel', value: `🔊 ${newState.channel?.name || 'N/A'}`, inline: true }
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();
        }

        // Streaming
        else if (oldState.streaming !== newState.streaming) {
            embed = new EmbedBuilder()
                .setColor(newState.streaming ? '#9b59b6' : '#95a5a6')
                .setTitle(newState.streaming ? '📺 Started Streaming' : '📺 Stopped Streaming')
                .addFields(
                    { name: 'User', value: `${member.user.tag}`, inline: true },
                    { name: 'Channel', value: `🔊 ${newState.channel?.name || 'N/A'}`, inline: true }
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();
        }

        if (embed) {
            await logChannel.send({ embeds: [embed] });
        }
    }
};
