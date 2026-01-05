const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Sets up the server with channels and roles for The Digital Den')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const guild = interaction.guild;
        await interaction.reply({ content: '🦊 Starting The Digital Den setup... This may take a moment.', ephemeral: true });

        try {
            // --- ROLES ---
            const rolesConfig = [
                {
                    name: '👑 Admin',
                    color: '#FF0000',
                    permissions: [PermissionFlagsBits.Administrator]
                },
                {
                    name: '🛡️ Moderator',
                    color: '#3498DB',
                    permissions: [
                        PermissionFlagsBits.KickMembers,
                        PermissionFlagsBits.BanMembers,
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.ModerateMembers, // Timeout
                        PermissionFlagsBits.MoveMembers,
                        PermissionFlagsBits.MuteMembers,
                        PermissionFlagsBits.DeafenMembers
                    ]
                },
                {
                    name: '🎙️ Voice Manager',
                    color: '#9B59B6',
                    permissions: [
                        PermissionFlagsBits.MoveMembers,
                        PermissionFlagsBits.MuteMembers,
                        PermissionFlagsBits.DeafenMembers
                    ]
                },
                {
                    name: '🎮 Gamer',
                    color: '#2ECC71'
                },
                {
                    name: '🎨 Artist',
                    color: '#E91E63'
                },
                {
                    name: '👤 Member',
                    color: '#95A5A6'
                }
            ];

            const createdRoles = {};
            for (const r of rolesConfig) {
                let role = guild.roles.cache.find(role => role.name === r.name);
                if (!role) {
                    role = await guild.roles.create({
                        name: r.name,
                        color: r.color,
                        permissions: r.permissions || [],
                        reason: 'Digital Den Setup'
                    });
                    console.log(`✓ Created role: ${r.name}`);
                } else {
                    console.log(`⚠️ Role already exists: ${r.name}`);
                }
                createdRoles[r.name] = role;
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
                let category = guild.channels.cache.find(c => c.name === cat.name && c.type === ChannelType.GuildCategory);
                if (!category) {
                    category = await guild.channels.create({
                        name: cat.name,
                        type: ChannelType.GuildCategory
                    });
                    console.log(`✓ Created category: ${cat.name}`);
                }

                for (const chan of cat.channels) {
                    const existing = guild.channels.cache.find(c => c.name === chan.name && c.parentId === category.id);
                    if (!existing) {
                        await guild.channels.create({
                            name: chan.name,
                            type: chan.type,
                            parent: category.id,
                            topic: chan.topic || ''
                        });
                        console.log(`✓ Created channel: ${chan.name}`);
                    } else {
                        console.log(`⚠️ Channel already exists: ${chan.name}`);
                    }
                }
            }

            await interaction.editReply({ content: '✅ Setup complete! Created roles and channels.' });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ An error occurred during setup.' });
        }
    }
};
