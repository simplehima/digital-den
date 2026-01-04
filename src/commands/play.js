const { SlashCommandBuilder } = require('discord.js');
const YTDlpWrap = require('yt-dlp-wrap').default;
const { createAudioResource, StreamType } = require('@discordjs/voice');
const { Readable } = require('stream');

// Initialize yt-dlp
const ytDlp = new YTDlpWrap();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song from YouTube or SoundCloud')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The URL or search term')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply();
        }

        // Make sure command is used in a server
        if (!interaction.guild) {
            return interaction.followUp('❌ This command can only be used in a server!');
        }

        // Fetch the member's voice state from the guild
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const channel = member?.voice?.channel;

        if (!channel) {
            return interaction.followUp('❌ You need to be in a voice channel!');
        }

        const query = interaction.options.getString('query');

        // Check if it's a YouTube URL
        const isYouTube = query.includes('youtube.com') || query.includes('youtu.be');

        try {
            if (isYouTube) {
                console.log(`[YouTube] Processing: ${query}`);

                // Build yt-dlp options with cookie support
                const ytDlpOptions = [
                    '--format', 'bestaudio',
                    '--no-playlist',
                    '--extract-audio',
                    '--audio-format', 'opus',
                    '--audio-quality', '0',
                ];

                // Add cookie support from environment variables
                if (process.env.COOKIES_FROM_BROWSER) {
                    ytDlpOptions.push('--cookies-from-browser', process.env.COOKIES_FROM_BROWSER);
                    console.log(`[YouTube] Using cookies from: ${process.env.COOKIES_FROM_BROWSER}`);
                } else if (process.env.COOKIES_FILE) {
                    ytDlpOptions.push('--cookies', process.env.COOKIES_FILE);
                    console.log(`[YouTube] Using cookies file: ${process.env.COOKIES_FILE}`);
                }

                // Get video info first
                const info = await ytDlp.getVideoInfo(query);
                const title = info.title || 'Unknown Title';

                console.log(`[YouTube] Fetching stream for: ${title}`);

                // Get audio stream URL
                const streamUrl = await ytDlp.execPromise([
                    ...ytDlpOptions,
                    '--get-url',
                    query
                ]);

                const finalUrl = streamUrl.trim().split('\n')[0];

                // Get or create DisTube voice connection
                const distube = interaction.client.distube;
                let voice = distube.voices.get(interaction.guildId);

                if (!voice) {
                    voice = await distube.voices.join(channel);
                }

                // Create audio resource from the stream URL
                const resource = createAudioResource(finalUrl, {
                    inputType: StreamType.Arbitrary,
                });

                // Play the audio
                voice.audioPlayer.play(resource);

                await interaction.followUp(`🎵 Now playing: **${title}**`);
                console.log(`[YouTube] Successfully playing: ${title}`);

            } else {
                // For non-YouTube (SoundCloud, etc.), use DisTube normally
                console.log(`[DisTube] Processing: ${query}`);
                await interaction.client.distube.play(channel, query, {
                    textChannel: interaction.channel,
                    member: interaction.member
                });

                await interaction.followUp('✅ Song added!');
            }
        } catch (error) {
            console.error('[Play Error]:', error);
            const errorMsg = error.message || 'Failed to play';
            await interaction.followUp(`❌ Error: ${errorMsg}`);
        }
    },
};
