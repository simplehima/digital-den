const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const PerspectiveAPI = require('../../utils/PerspectiveAPI');

// Initialize Perspective API (AI toxicity detection)
const perspectiveAPI = new PerspectiveAPI(process.env.PERSPECTIVE_API_KEY);

// Configuration - Comprehensive profanity list (English + Arabic/Egyptian)
const BAD_WORDS = [
    // English profanity
    'fuck', 'fucking', 'fucker', 'fucked', 'motherfucker', 'mootherfucker',
    'shit', 'shitting', 'shitty', 'bullshit',
    'bitch', 'bitches', 'bitching',
    'ass', 'asses', 'asshole', 'assfuck',
    'dick', 'dickhead', 'dicks',
    'cock', 'cocks',
    'pussy', 'pussies',
    'cunt', 'cunts',

    // Slurs
    'nigger', 'nigga', 'faggot', 'fag', 'retard', 'retarded',

    // Arabic/Egyptian profanity (various spellings)
    'kosomak', 'kosomk', 'ksmk', 'kossomak', 'kusumak', 'kosom', 'ksom',
    'kos', 'koss', 'ko$',
    'metnak', 'mtnak', 'mitnak', 'metnaka', 'mtnaka',
    'sharmota', 'sharmouta', 'sharmuta', '$armota', '$armouta',
    '5awal', 'khawal', '5awl', 'khawl',
    'a7a', 'a7aa', 'a77a', 'a777a', 'ahha',
    'zeby', 'zebi', 'zib', 'zebb',
    'teez', 'tiz', 'tezy', 'teezy', 'tizy',
    '3ars', '3rs', '3arss',
    'den omak', 'deen omak', 'din omak', 'omk',
    'ebn el kalb', 'ebn el wes5a', 'wes5a', 'weskha', 'was5a'
];

const ALLOWED_LINKS = ['discord.gg', 'discord.com', 'youtube.com', 'youtu.be', 'github.com', 'reddit.com', 'twitter.com', 'x.com'];
const SPAM_THRESHOLD = 5;
const SPAM_WINDOW = 5000; // 5 seconds
const CAPS_THRESHOLD = 0.7; // 70% caps
const CAPS_MIN_LENGTH = 10;
const MENTION_LIMIT = 5;

// Tracking
const spamMap = new Map();

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Ignore bots and DMs
        if (message.author.bot) return;
        if (!message.guild) return;

        // REMOVED ADMIN BYPASS - Now filters everyone including admins
        // Uncomment this line to skip filtering admins/moderators:
        // if (message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

        const userId = message.author.id;
        const content = message.content.toLowerCase();
        let violation = null;
        let action = 'delete';

        // 1. Bad Words Filter (HIGHEST PRIORITY)
        for (const word of BAD_WORDS) {
            // Use word boundaries to match whole words
            const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (regex.test(content)) {
                violation = { type: 'Profanity', detail: `Used prohibited language`, word };
                action = 'delete';
                break;
            }
        }

        // 1.5 AI-Based Toxicity Detection (if no violation yet)
        if (!violation && perspectiveAPI.enabled && message.content.length >= 3) {
            try {
                const scores = await perspectiveAPI.analyzeText(message.content);
                if (perspectiveAPI.isToxic(scores, 0.75)) { // 75% threshold
                    const toxicityType = perspectiveAPI.getTopToxicityType(scores);
                    violation = {
                        type: `AI: ${toxicityType}`,
                        detail: `AI detected: ${Math.round(scores.TOXICITY * 100)}% toxic`,
                        aiScores: scores
                    };
                    action = 'delete';
                }
            } catch (error) {
                console.error('[AUTOMOD] AI check error:', error.message);
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
        if (!violation && content.length > CAPS_MIN_LENGTH) {
            const caps = content.replace(/[^A-Z]/g, '').length;
            const ratio = caps / content.length;
            if (ratio > CAPS_THRESHOLD) {
                violation = { type: 'Excessive Caps', detail: `${Math.round(ratio * 100)}% capital letters` };
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
                // Delete the message
                await message.delete();
                console.log(`[AUTOMOD] Deleted message from ${message.author.tag}: ${violation.type}`);

                // Apply timeout if needed
                if (action === 'timeout') {
                    await message.member.timeout(5 * 60 * 1000, `AutoMod: ${violation.type}`);
                }

                // Send ephemeral reply in channel
                const replyMessage = await message.channel.send(
                    `${message.author} ⚠️ Your message was removed: **${violation.type}**`
                );

                // Auto-delete reply after 5 seconds
                setTimeout(() => {
                    replyMessage.delete().catch(() => { });
                }, 5000);

                // Log to moderation-logs channel
                const modLog = message.guild.channels.cache.find(ch => ch.name === 'moderation-logs');
                if (modLog) {
                    const embed = new EmbedBuilder()
                        .setColor('#E74C3C')
                        .setTitle(`🛡️ AutoMod: ${violation.type}`)
                        .setThumbnail(message.author.displayAvatarURL())
                        .addFields(
                            { name: 'User', value: `${message.author.tag}\n<@${userId}>`, inline: true },
                            { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
                            { name: 'Action', value: action === 'timeout' ? '⏱️ 5 min timeout' : '🗑️ Deleted', inline: true },
                            { name: 'Reason', value: violation.detail, inline: false }
                        )
                        .setFooter({ text: `User ID: ${userId}` })
                        .setTimestamp();

                    // Add message content if not too sensitive
                    if (violation.type !== 'Profanity') {
                        embed.addFields({ name: 'Content', value: message.content.substring(0, 1000) || '*[No content]*', inline: false });
                    } else {
                        embed.addFields({ name: 'Content', value: '*[Profanity detected - content hidden]*', inline: false });
                    }

                    await modLog.send({ embeds: [embed] });
                }

                // DM user warning
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setColor('#E74C3C')
                        .setTitle('⚠️ Message Removed')
                        .setDescription(`Your message in **${message.guild.name}** was automatically removed.`)
                        .addFields(
                            { name: 'Reason', value: violation.type, inline: true },
                            { name: 'Channel', value: `#${message.channel.name}`, inline: true }
                        )
                        .setFooter({ text: 'Please follow the server rules.' })
                        .setTimestamp();

                    if (action === 'timeout') {
                        dmEmbed.addFields({ name: 'Action', value: '⏱️ You have been timed out for 5 minutes', inline: false });
                    }

                    await message.author.send({ embeds: [dmEmbed] });
                } catch (error) {
                    // Ignore if user has DMs disabled
                    console.log(`[AUTOMOD] Could not DM ${message.author.tag}`);
                }

            } catch (error) {
                console.error('[AUTOMOD] Error handling violation:', error);
            }
        }
    }
};
