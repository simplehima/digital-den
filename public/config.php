<?php
// Discord OAuth Configuration
define('DISCORD_CLIENT_ID', '1456784848143257744');
define('DISCORD_CLIENT_SECRET', ''); // Get from .env-dis
define('DISCORD_REDIRECT_URI', 'https://digital-den.ibrahim-azab.com/callback.php');
define('DISCORD_BOT_TOKEN', ''); // Get from .env-dis

// Guild Configuration
define('GUILD_ID', '1457167466307260568');
define('OWNER_ID', '900786385525555200');

// Database
define('DB_PATH', __DIR__ . '/data/bot.db');

// Session
define('SESSION_LIFETIME', 86400); // 24 hours

// Discord API
define('DISCORD_API_BASE', 'https://discord.com/api/v10');
define('DISCORD_OAUTH_URL', 'https://discord.com/api/oauth2/authorize');
define('DISCORD_TOKEN_URL', 'https://discord.com/api/oauth2/token');

// Load sensitive data from .env-dis if available
$env_paths = [
    __DIR__ . '/../../.env-dis',
    __DIR__ . '/../.env-dis',
    __DIR__ . '/.env'
];

foreach ($env_paths as $env_file) {
    if (file_exists($env_file)) {
        $env = parse_ini_file($env_file);

        if (!defined('DISCORD_CLIENT_SECRET') && isset($env['CLIENT_SECRET'])) {
            define('DISCORD_CLIENT_SECRET', $env['CLIENT_SECRET']);
        }

        if (!defined('DISCORD_BOT_TOKEN') && isset($env['DISCORD_TOKEN'])) {
            define('DISCORD_BOT_TOKEN', $env['DISCORD_TOKEN']);
        }
        break;
    }
}

// Fallback if not loaded
if (!defined('DISCORD_CLIENT_SECRET')) {
    define('DISCORD_CLIENT_SECRET', '');
}
if (!defined('DISCORD_BOT_TOKEN')) {
    define('DISCORD_BOT_TOKEN', '');
}
?>