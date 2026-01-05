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
$env_file = __DIR__ . '/../../.env-dis';
if (file_exists($env_file)) {
    $env = parse_ini_file($env_file);
    if (isset($env['CLIENT_SECRET'])) {
        define('DISCORD_CLIENT_SECRET_LOADED', $env['CLIENT_SECRET']);
    }
    if (isset($env['DISCORD_TOKEN'])) {
        define('DISCORD_BOT_TOKEN_LOADED', $env['DISCORD_TOKEN']);
    }
}
?>