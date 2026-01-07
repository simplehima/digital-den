const { Collection } = require('discord.js');

class MusicQueue {
    constructor() {
        // Map of guildId -> queue object
        this.queues = new Collection();
    }

    /**
     * Get or create a queue for a guild
     */
    getQueue(guildId) {
        if (!this.queues.has(guildId)) {
            this.queues.set(guildId, {
                songs: [],
                currentSong: null,
                volume: 50,
                loopMode: 'off', // 'off', 'song', 'queue'
                voiceConnection: null,
                audioPlayer: null,
                textChannel: null
            });
        }
        return this.queues.get(guildId);
    }

    /**
     * Add a song to the queue
     */
    addSong(guildId, song) {
        const queue = this.getQueue(guildId);
        queue.songs.push(song);
        return queue.songs.length;
    }

    /**
     * Get the next song from the queue
     */
    getNext(guildId) {
        const queue = this.getQueue(guildId);

        // Handle loop modes
        if (queue.loopMode === 'song' && queue.currentSong) {
            return queue.currentSong;
        }

        if (queue.loopMode === 'queue' && queue.currentSong) {
            queue.songs.push(queue.currentSong);
        }

        const nextSong = queue.songs.shift();
        queue.currentSong = nextSong || null;
        return nextSong;
    }

    /**
     * Clear the queue
     */
    clear(guildId) {
        const queue = this.getQueue(guildId);
        queue.songs = [];
        queue.currentSong = null;
    }

    /**
     * Delete queue entirely
     */
    delete(guildId) {
        this.queues.delete(guildId);
    }

    /**
     * Get current song
     */
    getCurrentSong(guildId) {
        const queue = this.getQueue(guildId);
        return queue.currentSong;
    }

    /**
     * Get all songs in queue
     */
    getSongs(guildId) {
        const queue = this.getQueue(guildId);
        return queue.songs;
    }

    /**
     * Set loop mode
     */
    setLoopMode(guildId, mode) {
        const queue = this.getQueue(guildId);
        queue.loopMode = mode;
    }

    /**
     * Set volume
     */
    setVolume(guildId, volume) {
        const queue = this.getQueue(guildId);
        queue.volume = Math.max(0, Math.min(100, volume));
    }

    /**
     * Check if queue is empty
     */
    isEmpty(guildId) {
        const queue = this.getQueue(guildId);
        return queue.songs.length === 0 && !queue.currentSong;
    }

    /**
     * Get queue size
     */
    size(guildId) {
        const queue = this.getQueue(guildId);
        return queue.songs.length;
    }
}

// Export singleton instance
module.exports = new MusicQueue();
