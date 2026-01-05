const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Configuration
const BAD_WORDS = ['fuck', 'shit', 'bitch', 'asshole', 'nigger', 'faggot', 'retard'];
const ALLOWED_LINKS = ['discord.gg', 'discord.com', 'youtube.com', 'youtu.be', 'github.com'];
const SPAM_THRESHOLD = 5;
const SPAM_WINDOW = 5000;
const CAPS_THRESHOLD = 0.7; // 70% caps
const MENTION_LIMIT = 5;

// Tracking
const spamMap = new Map();

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        // Skip if user is admin/moderator
        if (message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

        const userId = message.author.id;
        const content = message.content.toLowerCase();
        let violation = null;
        let action = 'delete';

        // 1. Bad Words Filter
        for (const word of BAD_WORDS) {
            if (content.includes(word)) {
                violation = { type: 'Bad Word', detail: `Used prohibited word` };
                action = 'warn';
                break;
            }
        }

        // 2. Link Filter (if no violation yet)
        if (!violation) {
            const linkRegex = /https?:\/\/[^\s]+/gi;
            const links = content.match(linkRegex) || [];

            for (const link of links) {
                const isAllowed = ALLOWED_LINKS.some(allowed => link.includes(allowed));
                if (!isAllowed) {
                    violation = { type: 'Unauthorized Link', detail: 'Posted non-whitelisted link' };
                    action = 'delete';
                    break;
                }
            }
        }

        // 3. Anti-Caps
        if (!violation && content.length > 10) {
            const caps = content.replace(/[^A-Z]/g, '').length;
            const ratio = caps / content.length;
            if (ratio > CAPS_THRESHOLD) {
                violation = { type: 'Excessive Caps', detail: 'Too many capital letters' };
                action = 'delete';
            }
        }

        // 4. Anti-Mass Mention
        if (!violation) {
            const mentions = message.mentions.users.size + message.mentions.roles.size;
            if (mentions > MENTION_LIMIT) {
                violation = { type: 'Mass Mention', detail: `Mentioned ${mentions} users/roles` };
                action = 'timeout';
            }
        }

        // 5. Spam Detection
        if (!violation) {
            const now = Date.now();
            if (!spamMap.has(userId)) spamMap.set(userId, []);

            const times = spamMap.get(userId);
            times.push(now);
            const recent = times.filter(t => now - t < SPAM_WINDOW);
            spamMap.set(userId, recent);

            if (recent.length >= SPAM_THRESHOLD) {
                violation = { type: 'Spam', detail: `Sent ${recent.length} messages in ${SPAM_WINDOW / 1000}s` };
                action = 'timeout';
                spamMap.delete(userId);
            }
        }

        // Handle violation
        if (violation) {
            try {
                await message.delete();

                if (action === 'timeout') {
                    await message.member.timeout(5 * 60 * 1000, `AutoMod: ${violation.type}`);
                }

                // Log to mod-log
                const modLog = message.guild.channels.cache.find(ch => ch.name === 'moderation-logs');
                if (modLog) {
                    const embed = new EmbedBuilder()
                        .setColor('#E74C3C')
                        .setTitle(`⚠️ AutoMod: ${violation.type}`)
                        .addFields(
                            { name: 'User', value: `${message.author.tag} (${userId})`, inline: true },
                            { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
                            { name: 'Action', value: action === 'timeout' ? '5 min timeout' : 'Message deleted', inline: true },
                            { name: 'Details', value: violation.detail, inline: false }
                        )
                        .setTimestamp();

                    await modLog.send({ embeds: [embed] });
                }

                // DM user warning
                try {
                    await message.author.send(`⚠️ Your message in **${message.guild.name}** was removed.\n**Reason:** ${violation.type}\n**Details:** ${violation.detail}`);
                } catch { } // Ignore if DMs are closed

            } catch (error) {
                console.error('AutoMod error:', error);
            }
        }
    }
};
