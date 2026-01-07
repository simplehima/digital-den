const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicPlayer = require('../../utils/MusicPlayer');
const musicQueue = require('../../utils/MusicQueue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the music queue')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Page number')
                .setRequired(false)
        ),

    async execute(interaction) {
        const currentSong = musicQueue.getCurrentSong(interaction.guildId);
        const songs = musicQueue.getSongs(interaction.guildId);
        const queue = musicQueue.getQueue(interaction.guildId);

        if (!currentSong && songs.length === 0) {
            return await interaction.reply({
                content: '❌ Queue is empty! Use `/play` to add songs.',
                ephemeral: true
            });
        }

        const page = interaction.options.getInteger('page') || 1;
        const songsPerPage = 10;
        const maxPages = Math.ceil(songs.length / songsPerPage) || 1;
        const actualPage = Math.max(1, Math.min(page, maxPages));

        const start = (actualPage - 1) * songsPerPage;
        const end = start + songsPerPage;
        const pageSongs = songs.slice(start, end);

        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🎵 Music Queue')
            .setTimestamp();

        // Current song
        if (currentSong) {
            embed.addFields({
                name: '🎵 Now Playing',
                value: `**[${currentSong.title}](${currentSong.url})**\n` +
                    `Duration: ${musicPlayer.formatDuration(currentSong.duration)} | ` +
                    `Requested by: ${currentSong.requestedBy?.username || 'Unknown'}`,
                inline: false
            });
        }

        // Queue
        if (pageSongs.length > 0) {
            const queueText = pageSongs.map((song, index) => {
                const position = start + index + 1;
                return `**${position}.** [${song.title}](${song.url})\n` +
                    `Duration: ${musicPlayer.formatDuration(song.duration)} | ` +
                    `Requested by: ${song.requestedBy?.username || 'Unknown'}`;
            }).join('\n\n');

            embed.addFields({
                name: '📜 Up Next',
                value: queueText,
                inline: false
            });
        }

        // Footer with stats
        const totalDuration = songs.reduce((acc, song) => acc + song.duration, 0);
        embed.setFooter({
            text: `Page ${actualPage}/${maxPages} | ${songs.length} song(s) in queue | ` +
                `Loop: ${queue.loopMode} | Volume: ${queue.volume}%`
        });

        await interaction.reply({ embeds: [embed] });
    },
};
