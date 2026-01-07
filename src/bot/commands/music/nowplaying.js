const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicPlayer = require('../../utils/MusicPlayer');
const musicQueue = require('../../utils/MusicQueue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show the currently playing song'),

    async execute(interaction) {
        const currentSong = musicQueue.getCurrentSong(interaction.guildId);
        const queue = musicQueue.getQueue(interaction.guildId);

        if (!currentSong) {
            return await interaction.reply({
                content: '❌ Nothing is playing right now!',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#E91E63')
            .setTitle('🎵 Now Playing')
            .setDescription(`**[${currentSong.title}](${currentSong.url})**`)
            .addFields(
                { name: 'Channel', value: currentSong.channel || 'Unknown', inline: true },
                { name: 'Duration', value: musicPlayer.formatDuration(currentSong.duration), inline: true },
                { name: 'Requested by', value: currentSong.requestedBy?.username || 'Unknown', inline: true },
                { name: 'Volume', value: `${queue.volume}%`, inline: true },
                { name: 'Loop Mode', value: queue.loopMode, inline: true },
                { name: 'Queue Size', value: `${musicQueue.size(interaction.guildId)} song(s)`, inline: true }
            )
            .setThumbnail(currentSong.thumbnail)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
