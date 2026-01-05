<?php
require_once 'includes/auth.php';
require_once 'includes/db.php';

$user = requireAuth();
$db = Database::getInstance();

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $db->setSetting('automod_spam', isset($_POST['automod_spam']) ? '1' : '0');
    $db->setSetting('automod_badwords', isset($_POST['automod_badwords']) ? '1' : '0');
    $db->setSetting('automod_links', isset($_POST['automod_links']) ? '1' : '0');
    $db->setSetting('automod_caps', isset($_POST['automod_caps']) ? '1' : '0');
    $db->setSetting('automod_mentions', isset($_POST['automod_mentions']) ? '1' : '0');

    if (isset($_POST['badwords_list'])) {
        $db->setSetting('badwords_list', $_POST['badwords_list']);
    }
    if (isset($_POST['whitelist_links'])) {
        $db->setSetting('whitelist_links', $_POST['whitelist_links']);
    }

    $saved = true;
}

// Get current settings
$spam = $db->getSetting('automod_spam', '1');
$badwords = $db->getSetting('automod_badwords', '1');
$links = $db->getSetting('automod_links', '1');
$caps = $db->getSetting('automod_caps', '1');
$mentions = $db->getSetting('automod_mentions', '1');
$badwordsList = $db->getSetting('badwords_list', 'fuck,shit,bitch');
$whitelistLinks = $db->getSetting('whitelist_links', 'discord.gg,discord.com,youtube.com');
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AutoMod - The Digital Den</title>
    <link rel="icon" type="image/png" href="assets/favicon.png">
    <link rel="stylesheet" href="assets/dashboard.css">
</head>

<body>
    <?php include 'includes/nav.php'; ?>

    <div class="container">
        <h1>🛡️ Auto-Moderation Settings</h1>

        <?php if (isset($saved)): ?>
            <div class="alert success">✅ Settings saved! Note: Bot must be restarted for changes to take effect.</div>
        <?php endif; ?>

        <form method="POST">
            <div class="settings-section card">
                <h2>Protection Modules</h2>

                <div class="toggle-row">
                    <label>
                        <input type="checkbox" name="automod_spam" <?php echo $spam == '1' ? 'checked' : ''; ?>>
                        <span class="toggle-label">🚫 Anti-Spam</span>
                    </label>
                    <small>Detect and timeout users sending messages too quickly</small>
                </div>

                <div class="toggle-row">
                    <label>
                        <input type="checkbox" name="automod_badwords" <?php echo $badwords == '1' ? 'checked' : ''; ?>>
                        <span class="toggle-label">🤬 Bad Words Filter</span>
                    </label>
                    <small>Delete messages containing prohibited words</small>
                </div>

                <div class="toggle-row">
                    <label>
                        <input type="checkbox" name="automod_links" <?php echo $links == '1' ? 'checked' : ''; ?>>
                        <span class="toggle-label">🔗 Link Filter</span>
                    </label>
                    <small>Only allow links from whitelisted domains</small>
                </div>

                <div class="toggle-row">
                    <label>
                        <input type="checkbox" name="automod_caps" <?php echo $caps == '1' ? 'checked' : ''; ?>>
                        <span class="toggle-label">🔠 Anti-Caps</span>
                    </label>
                    <small>Remove messages with excessive capital letters</small>
                </div>

                <div class="toggle-row">
                    <label>
                        <input type="checkbox" name="automod_mentions" <?php echo $mentions == '1' ? 'checked' : ''; ?>>
                        <span class="toggle-label">📢 Anti-Mass Mention</span>
                    </label>
                    <small>Prevent mass-pinging of users/roles</small>
                </div>
            </div>

            <div class="settings-section card">
                <h2>Word Blacklist</h2>
                <div class="form-group">
                    <label>Prohibited Words (comma-separated)</label>
                    <textarea name="badwords_list" rows="3"><?php echo htmlspecialchars($badwordsList); ?></textarea>
                </div>
            </div>

            <div class="settings-section card">
                <h2>Allowed Domains</h2>
                <div class="form-group">
                    <label>Whitelisted Link Domains (comma-separated)</label>
                    <textarea name="whitelist_links"
                        rows="3"><?php echo htmlspecialchars($whitelistLinks); ?></textarea>
                </div>
            </div>

            <button type="submit" class="btn-primary">💾 Save Settings</button>
        </form>
    </div>

    <style>
        .toggle-row {
            padding: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .toggle-row:last-child {
            border-bottom: none;
        }

        .toggle-row label {
            display: flex;
            align-items: center;
            gap: 1rem;
            cursor: pointer;
        }

        .toggle-label {
            font-weight: bold;
            font-size: 1.1rem;
        }

        .toggle-row small {
            display: block;
            color: #888;
            margin-left: 2.5rem;
            margin-top: 0.5rem;
        }

        .settings-section {
            margin-bottom: 2rem;
        }

        .settings-section h2 {
            color: #8a2be2;
            margin-bottom: 1rem;
        }

        textarea {
            width: 100%;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 1rem;
            color: white;
            font-family: monospace;
        }

        .alert.success {
            background: rgba(46, 204, 113, 0.2);
            border: 1px solid #2ecc71;
            color: #2ecc71;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }
    </style>
</body>

</html>