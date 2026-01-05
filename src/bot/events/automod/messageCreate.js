const { EmbedBuilder } = require('discord.js');

// Spam tracking
const spamMap = new Map();
const SPAM_THRESHOLD = 5; // messages
const SPAM_WINDOW = 5000; // 5 seconds

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        const userId = message.author.id;
        const now = Date.now();

        // Check spam
        if (!spamMap.has(userId)) {
            spamMap.set(userId, []);
        }

        const userMessages = spamMap.get(userId);
        userMessages.push(now);

        // Clean old messages
        const recentMessages = userMessages.filter(time => now - time < SPAM_WINDOW);
        spamMap.set(userId, recentMessages);

        // Detect spam
        if (recentMessages.length >= SPAM_THRESHOLD) {
            try {
                // Delete recent messages
                const messages = await message.channel.messages.fetch({ limit: 10 });
                const userSpam = messages.filter(m =>
                    m.author.id === userId &&
                    now - m.createdTimestamp < SPAM_WINDOW
                );

                await message.channel.bulkDelete(userSpam);

                // Timeout user
                const member = await message.guild.members.fetch(userId);
                await member.timeout(5 * 60 * 1000, 'Auto-moderation: Spam detected');

                // Log
                const modLog = message.guild.channels.cache.find(ch => ch.name === 'moderation-logs');
                if (modLog) {
                    const embed = new EmbedBuilder()
                        .setColor('#E74C3C')
                        .setTitle('⚠️ Auto-Mod: Spam Detected')
                        .addFields(
                            { name: 'User', value: `${message.author.tag} (${userId})`, inline: true },
                            { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
                            { name: 'Action', value: '5 minute timeout', inline: false }
                        )
                        .setTimestamp();

                    await modLog.send({ embeds: [embed] });
                }

                // Clear spam tracking
                spamMap.delete(userId);

            } catch (error) {
                console.error('Auto-mod spam error:', error);
            }
        }
    }
};
