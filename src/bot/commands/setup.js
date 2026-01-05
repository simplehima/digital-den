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
                { name: 'Admin', color: '#FF0000', permissions: [PermissionFlagsBits.Administrator] },
                { name: 'Moderator', color: '#0000FF', permissions: [PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers, PermissionFlagsBits.ManageMessages] },
                { name: 'Gamer', color: '#00FF00' },
                { name: 'Artist', color: '#FF00FF' },
                { name: 'Member', color: '#808080' }
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
                }
                createdRoles[r.name] = role;
            }

            // --- CATEGORIES & CHANNELS ---
            const categories = [
                {
                    name: 'Welcome',
                    channels: [
                        { name: 'welcome', type: ChannelType.GuildText, topic: 'Welcome to the den!' }
                    ]
                },
                {
                    name: 'Information',
                    channels: [
                        { name: 'rules', type: ChannelType.GuildText, topic: 'Read the rules here.' },
                        { name: 'announcements', type: ChannelType.GuildText, topic: 'Important updates.' }
                    ]
                },
                {
                    name: 'Tech & Gaming',
                    channels: [
                        { name: 'pc-specs', type: ChannelType.GuildText, topic: 'Show off your rig.' },
                        { name: 'gaming-general', type: ChannelType.GuildText, topic: 'Talk about games.' },
                        { name: 'voice-gaming', type: ChannelType.GuildVoice }
                    ]
                },
                {
                    name: 'The Creative Corner',
                    channels: [
                        { name: 'art-showcase', type: ChannelType.GuildText, topic: 'Post your art.' },
                        { name: 'code-projects', type: ChannelType.GuildText, topic: 'Share your code.' },
                        { name: 'music-share', type: ChannelType.GuildText, topic: 'Share your beats.' }
                    ]
                },
                {
                    name: 'Social',
                    channels: [
                        { name: 'general-chat', type: ChannelType.GuildText, topic: 'Chat about anything.' },
                        { name: 'memes', type: ChannelType.GuildText, topic: 'Post memes.' },
                        { name: 'chill-voice', type: ChannelType.GuildVoice }
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
                }

                for (const chan of cat.channels) {
                    // Check if channel exists in this category
                    const existing = guild.channels.cache.find(c => c.name === chan.name && c.parentId === category.id);
                    if (!existing) {
                        await guild.channels.create({
                            name: chan.name,
                            type: chan.type,
                            parent: category.id,
                            topic: chan.topic || ''
                        });
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
