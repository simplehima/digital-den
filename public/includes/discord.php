<?php
require_once __DIR__ . '/../config.php';

class Discord
{
    public static function getOAuthURL()
    {
        $params = http_build_query([
            'client_id' => DISCORD_CLIENT_ID,
            'redirect_uri' => DISCORD_REDIRECT_URI,
            'response_type' => 'code',
            'scope' => 'identify guilds'
        ]);
        return DISCORD_OAUTH_URL . '?' . $params;
    }

    public static function exchangeCode($code)
    {
        $ch = curl_init(DISCORD_TOKEN_URL);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'client_id' => DISCORD_CLIENT_ID,
            'client_secret' => DISCORD_CLIENT_SECRET,
            'grant_type' => 'authorization_code',
            'code' => $code,
            'redirect_uri' => DISCORD_REDIRECT_URI
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);

        $response = curl_exec($ch);
        curl_close($ch);

        return json_decode($response, true);
    }

    public static function getUserInfo($accessToken)
    {
        return self::apiRequest('/users/@me', $accessToken);
    }

    public static function getUserGuilds($accessToken)
    {
        return self::apiRequest('/users/@me/guilds', $accessToken);
    }

    public static function isAdmin($accessToken)
    {
        $guilds = self::getUserGuilds($accessToken);

        foreach ($guilds as $guild) {
            if ($guild['id'] === GUILD_ID) {
                $permissions = $guild['permissions'];
                return ($permissions & 0x8) === 0x8; // Administrator permission
            }
        }

        return false;
    }

    private static function apiRequest($endpoint, $token)
    {
        $ch = curl_init(DISCORD_API_BASE . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json'
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        return json_decode($response, true);
    }
}
?>