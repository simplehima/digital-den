const {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState
} = require('@discordjs/voice');
const play = require('play-dl');
const fs = require('fs');
const path = require('path');
const musicQueue = require('./MusicQueue');

class MusicPlayer {
    constructor() {
        this.cookiesLoaded = false;
        this.loadCookies();
    }

    /**
     * Load YouTube cookies if available
     */
    async loadCookies() {
        const cookiePath = path.join(__dirname, '../../../cookies.txt');

        if (fs.existsSync(cookiePath)) {
            try {
                const cookieFileContent = fs.readFileSync(cookiePath, 'utf-8');

                // Parse Netscape cookies.txt format and convert to cookie string
                const cookieLines = cookieFileContent.split(/\r?\n/)
                    .filter(line => line.trim() && !line.startsWith('#'))
                    .map(line => {
                        const parts = line.split('\t');
                        if (parts.length >= 7) {
                            // Format: domain, flag, path, secure, expiration, name, value
                            const name = parts[5].trim();
                            const value = parts[6].trim();
                            return `${name}=${value}`;
                        }
                        return null;
                    })
                    .filter(cookie => cookie !== null);

                const cookieString = cookieLines.join('; ');

                if (cookieString) {
                    await play.setToken({
                        youtube: {
                            cookie: cookieString
                        }
                    });
                    this.cookiesLoaded = true;
                    console.log('[MUSIC] YouTube cookies loaded successfully');
                    console.log(`[MUSIC] Loaded ${cookieLines.length} cookies`);
                } else {
                    console.log('[MUSIC] No valid cookies found in cookies.txt');
                }
            } catch (error) {
                console.error('[MUSIC] Failed to load cookies:', error.message);
            }
        } else {
            console.log('[MUSIC] No cookies.txt found - YouTube may have restrictions');
        }
    }

    /**
     * Join a voice channel
     */
    async joinChannel(voiceChannel) {
        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            // Wait for connection to be ready
            await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
            return connection;
        } catch (error) {
            console.error('[MUSIC] Failed to join voice channel:', error);
            throw error;
        }
    }

    /**
     * Get song info from URL or search query
     */
    async getSongInfo(query) {
        try {
            let url = query;

            // If not a URL, search for it
            if (!query.startsWith('http')) {
                const searchResults = await play.search(query, { limit: 1 });
                if (searchResults.length === 0) {
                    throw new Error('No results found');
                }
                url = searchResults[0].url;
            }

            // Validate URL
            const isValid = play.yt_validate(url);
            if (isValid !== 'video') {
                throw new Error('Invalid YouTube video URL');
            }

            // Get video info
            const info = await play.video_info(url);

            return {
                title: info.video_details.title,
                url: info.video_details.url,
                duration: info.video_details.durationInSec,
                thumbnail: info.video_details.thumbnails[0]?.url,
                channel: info.video_details.channel?.name,
                requestedBy: null // Set by command
            };
        } catch (error) {
            console.error('[MUSIC] Error getting song info:', error);
            throw error;
        }
    }

    /**
     * Play a song
     */
    async playSong(guildId, interaction) {
        const queue = musicQueue.getQueue(guildId);
        const song = musicQueue.getCurrentSong(guildId);

        if (!song) {
            // Queue is empty
            if (queue.voiceConnection) {
                queue.voiceConnection.destroy();
                queue.voiceConnection = null;
            }
            return null;
        }

        try {
            // Create audio player if doesn't exist
            if (!queue.audioPlayer) {
                queue.audioPlayer = createAudioPlayer();

                // Handle player events
                queue.audioPlayer.on(AudioPlayerStatus.Idle, async () => {
                    // Song finished, play next
                    const nextSong = musicQueue.getNext(guildId);
                    if (nextSong) {
                        await this.playSong(guildId, interaction);
                    } else {
                        // Queue finished
                        await interaction.channel?.send('Queue finished! 🎵');
                        if (queue.voiceConnection) {
                            queue.voiceConnection.destroy();
                        }
                        musicQueue.delete(guildId);
                    }
                });

                queue.audioPlayer.on('error', async (error) => {
                    console.error('[MUSIC] Audio player error:', error);
                    await interaction.channel?.send('❌ An error occurred while playing. Skipping...');
                    const nextSong = musicQueue.getNext(guildId);
                    if (nextSong) {
                        await this.playSong(guildId, interaction);
                    }
                });

                queue.voiceConnection.subscribe(queue.audioPlayer);
            }

            // Get audio stream
            const stream = await play.stream(song.url);
            const resource = createAudioResource(stream.stream, {
                inputType: stream.type,
                inlineVolume: true
            });

            // Set volume
            resource.volume?.setVolume(queue.volume / 100);

            // Play the resource
            queue.audioPlayer.play(resource);

            return song;
        } catch (error) {
            console.error('[MUSIC] Error playing song:', error);
            throw error;
        }
    }

    /**
     * Format duration (seconds to MM:SS)
     */
    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Create progress bar
     */
    createProgressBar(current, total, barLength = 20) {
        const progress = Math.floor((current / total) * barLength);
        const bar = '▬'.repeat(progress) + '🔘' + '▬'.repeat(barLength - progress);
        return bar;
    }
}

// Export singleton instance
module.exports = new MusicPlayer();
