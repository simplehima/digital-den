const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Sets up the server with channels and roles for The Digital Den')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const guild = interaction.guild;

        // Owner-only check
        if (interaction.user.id !== '900786385525555200') {
            return await interaction.reply({
                content: '❌ Only the server owner can run this command!',
                ephemeral: true
            });
        }

        // Defer reply for long-running operation
        await interaction.deferReply({ ephemeral: true });

        try {
            // --- DELETE OLD ROLES (except @everyone and managed roles) ---
            const rolesToDelete = guild.roles.cache.filter(role =>
                role.name !== '@everyone' &&
                !role.managed &&
                role.position < guild.members.me.roles.highest.position // Only delete roles below bot's highest role
            );

            for (const [id, role] of rolesToDelete) {
                try {
                    await role.delete('Digital Den Setup - Cleanup');
                    console.log(`🗑️ Deleted role: ${role.name}`);
                } catch (err) {
                    console.log(`⚠️ Could not delete role: ${role.name}`);
                }
            }

            // --- DELETE OLD CHANNELS ---
            const channelsToDelete = guild.channels.cache.filter(channel =>
                channel.type !== ChannelType.GuildCategory ||
                guild.channels.cache.some(c => c.parentId === channel.id)
            );

            for (const [id, channel] of channelsToDelete) {
                try {
                    await channel.delete('Digital Den Setup - Cleanup');
                    console.log(`🗑️ Deleted channel: ${channel.name}`);
                } catch (err) {
                    console.log(`⚠️ Could not delete channel: ${channel.name}`);
                }
            }

            // --- CREATE ROLES (WITH HOISTING) ---
            const rolesConfig = [
                {
                    name: '👑 Admin',
                    colors: 0xFF0000,
                    permissions: [PermissionFlagsBits.Administrator],
                    hoist: true // Display separately
                },
                {
                    name: '🛡️ Moderator',
                    colors: 0x3498DB,
                    permissions: [
                        PermissionFlagsBits.KickMembers,
                        PermissionFlagsBits.BanMembers,
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.ModerateMembers,
                        PermissionFlagsBits.MoveMembers,
                        PermissionFlagsBits.MuteMembers,
                        PermissionFlagsBits.DeafenMembers
                    ],
                    hoist: true
                },
                {
                    name: '🎙️ Voice Manager',
                    colors: 0x9B59B6,
                    permissions: [
                        PermissionFlagsBits.MoveMembers,
                        PermissionFlagsBits.MuteMembers,
                        PermissionFlagsBits.DeafenMembers
                    ],
                    hoist: true
                },
                {
                    name: '🎮 Gamer',
                    colors: 0x2ECC71,
                    hoist: true
                },
                {
                    name: '🎨 Artist',
                    colors: 0xE91E63,
                    hoist: true
                },
                {
                    name: '👤 Member',
                    colors: 0x95A5A6,
                    hoist: false
                }
            ];

            for (const r of rolesConfig) {
                const role = await guild.roles.create({
                    name: r.name,
                    color: r.colors,
                    permissions: r.permissions || [],
                    hoist: r.hoist,
                    reason: 'Digital Den Setup'
                });
                console.log(`✓ Created role: ${r.name}`);
            }

            // --- CATEGORIES & CHANNELS ---
            const categories = [
                {
                    name: '📢 WELCOME',
                    channels: [
                        { name: '👋welcome', type: ChannelType.GuildText, topic: '🦊 Welcome to The Digital Den!' }
                    ]
                },
                {
                    name: '📋 INFORMATION',
                    channels: [
                        { name: '📜rules', type: ChannelType.GuildText, topic: 'Server rules and guidelines' },
                        { name: '📣announcements', type: ChannelType.GuildText, topic: 'Important server updates' }
                    ]
                },
                {
                    name: '🎮 TECH & GAMING',
                    channels: [
                        { name: '💻pc-specs', type: ChannelType.GuildText, topic: 'Show off your rig' },
                        { name: '🎮gaming-general', type: ChannelType.GuildText, topic: 'Talk about games' },
                        { name: '🔊gaming-voice', type: ChannelType.GuildVoice }
                    ]
                },
                {
                    name: '🎨 CREATIVE CORNER',
                    channels: [
                        { name: '🖼️art-showcase', type: ChannelType.GuildText, topic: 'Share your artwork' },
                        { name: '💻code-projects', type: ChannelType.GuildText, topic: 'Share your code' },
                        { name: '🎵music-share', type: ChannelType.GuildText, topic: 'Share your music' }
                    ]
                },
                {
                    name: '💬 SOCIAL',
                    channels: [
                        { name: '💭general-chat', type: ChannelType.GuildText, topic: 'Hang out and chat' },
                        { name: '😂memes', type: ChannelType.GuildText, topic: 'Post your best memes' },
                        { name: '🎧chill-voice', type: ChannelType.GuildVoice }
                    ]
                }
            ];

            for (const cat of categories) {
                const category = await guild.channels.create({
                    name: cat.name,
                    type: ChannelType.GuildCategory
                });
                console.log(`✓ Created category: ${cat.name}`);

                for (const chan of cat.channels) {
                    await guild.channels.create({
                        name: chan.name,
                        type: chan.type,
                        parent: category.id,
                        topic: chan.topic || ''
                    });
                    console.log(`✓ Created channel: ${chan.name}`);
                }
            }

            await interaction.editReply({ content: '✅ Setup complete! The Digital Den is ready. 🦊' });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ An error occurred during setup.' });
        }
    }
};
