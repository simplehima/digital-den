const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createlogchannels')
        .setDescription('📊 Create log channels without deleting existing ones')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Check if owner
        if (interaction.user.id !== interaction.guild.ownerId) {
            return await interaction.reply({ content: '❌ Only the server owner can use this command.', ephemeral: true });
        }

        await interaction.deferReply();

        const guild = interaction.guild;

        try {
            // Find or create LOGS category
            let logsCategory = guild.channels.cache.find(c => c.name === '📊 LOGS' && c.type === ChannelType.GuildCategory);

            if (!logsCategory) {
                logsCategory = await guild.channels.create({
                    name: '📊 LOGS',
                    type: ChannelType.GuildCategory
                });
                console.log('✓ Created LOGS category');
            }

            // Log channels to create
            const logChannels = [
                { name: 'message-logs', topic: '📝 Message deletion and edit logs' },
                { name: 'voice-logs', topic: '🔊 Voice channel activity logs' },
                { name: 'member-logs', topic: '👥 Member join, leave, role changes' },
                { name: 'server-logs', topic: '⚙️ Role and channel changes' },
                { name: 'moderation-logs', topic: '🛡️ Moderation action logs' }
            ];

            let created = 0;
            let skipped = 0;

            for (const chan of logChannels) {
                // Check if channel already exists
                const existing = guild.channels.cache.find(c => c.name === chan.name);

                if (existing) {
                    console.log(`⏭️ Channel ${chan.name} already exists, skipping`);
                    skipped++;
                } else {
                    await guild.channels.create({
                        name: chan.name,
                        type: ChannelType.GuildText,
                        parent: logsCategory.id,
                        topic: chan.topic,
                        permissionOverwrites: [
                            {
                                id: guild.id, // @everyone
                                deny: ['ViewChannel'] // Hide from regular members
                            },
                            {
                                id: guild.roles.cache.find(r => r.name === '👑 Admin')?.id || guild.ownerId,
                                allow: ['ViewChannel', 'ReadMessageHistory']
                            },
                            {
                                id: guild.roles.cache.find(r => r.name === '🛡️ Moderator')?.id || guild.ownerId,
                                allow: ['ViewChannel', 'ReadMessageHistory']
                            }
                        ]
                    });
                    console.log(`✓ Created channel: ${chan.name}`);
                    created++;
                }
            }

            await interaction.editReply({
                content: `✅ Log channels ready!\n\n📁 Created: ${created} channels\n⏭️ Skipped: ${skipped} (already exist)\n\nChannels: #message-logs, #voice-logs, #member-logs, #server-logs, #moderation-logs`
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ An error occurred while creating log channels.' });
        }
    }
};
