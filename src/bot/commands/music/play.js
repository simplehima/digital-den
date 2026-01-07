const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GuildMember } = require('discord.js');
const musicPlayer = require('../../utils/MusicPlayer');
const musicQueue = require('../../utils/MusicQueue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song from YouTube')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('YouTube URL or search query')
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            // Check if user is in a voice channel
            if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
                return await interaction.reply({
                    content: '❌ You need to be in a voice channel to play music!',
                    ephemeral: true
                });
            }

            const voiceChannel = interaction.member.voice.channel;
            const query = interaction.options.getString('query');

            await interaction.deferReply();

            // Get song info
            const songInfo = await musicPlayer.getSongInfo(query);
            songInfo.requestedBy = interaction.user;

            const queue = musicQueue.getQueue(interaction.guildId);
            const isFirstSong = musicQueue.isEmpty(interaction.guildId);

            // Add to queue
            const position = musicQueue.addSong(interaction.guildId, songInfo);

            if (isFirstSong) {
                // Join voice channel and start playing
                queue.voiceConnection = await musicPlayer.joinChannel(voiceChannel);
                queue.textChannel = interaction.channel;

                // Get first song and play
                musicQueue.getNext(interaction.guildId);
                await musicPlayer.playSong(interaction.guildId, interaction);

                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('🎵 Now Playing')
                    .setDescription(`**[${songInfo.title}](${songInfo.url})**`)
                    .addFields(
                        { name: 'Channel', value: songInfo.channel || 'Unknown', inline: true },
                        { name: 'Duration', value: musicPlayer.formatDuration(songInfo.duration), inline: true },
                        { name: 'Requested by', value: songInfo.requestedBy.username, inline: true }
                    )
                    .setThumbnail(songInfo.thumbnail)
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            } else {
                // Added to queue
                const embed = new EmbedBuilder()
                    .setColor('#0099FF')
                    .setTitle('➕ Added to Queue')
                    .setDescription(`**[${songInfo.title}](${songInfo.url})**`)
                    .addFields(
                        { name: 'Position', value: `#${position}`, inline: true },
                        { name: 'Duration', value: musicPlayer.formatDuration(songInfo.duration), inline: true },
                        { name: 'Requested by', value: songInfo.requestedBy.username, inline: true }
                    )
                    .setThumbnail(songInfo.thumbnail)
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('[PLAY] Error:', error);
            const errorMessage = error.message.includes('No results found')
                ? '❌ No results found for that query.'
                : '❌ An error occurred while trying to play that song.';

            if (interaction.deferred) {
                await interaction.editReply({ content: errorMessage });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    },
};
