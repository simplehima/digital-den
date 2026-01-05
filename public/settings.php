<?php
require_once 'includes/auth.php';
require_once 'includes/db.php';

$user = requireAuth();
$db = Database::getInstance();

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    foreach ($_POST as $key => $value) {
        if ($key !== 'submit') {
            $db->setSetting($key, $value);
        }
    }
    $saved = true;
}

// Get current settings
$logRetention = $db->getSetting('log_retention_days', '30');
$logMessages = $db->getSetting('log_messages', '1');
$logVoice = $db->getSetting('log_voice', '1');
$logModeration = $db->getSetting('log_moderation', '1');
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Settings - The Digital Den</title>
    <link rel="icon" type="image/png" href="assets/favicon.png">
    <link rel="stylesheet" href="assets/dashboard.css">
</head>

<body>
    <?php include 'includes/nav.php'; ?>

    <div class="container">
        <h1>⚙️ Bot Settings</h1>

        <?php if (isset($saved)): ?>
            <div class="alert success">
                ✅ Settings saved successfully!
            </div>
        <?php endif; ?>

        <div class="settings-container card">
            <form method="POST" class="settings-form">
                <div class="settings-section">
                    <h2>📊 Logging Settings</h2>

                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="log_messages" value="1" <?php echo $logMessages == '1' ? 'checked' : ''; ?>>
                            Log Message Events (Delete/Edit)
                        </label>
                    </div>

                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="log_voice" value="1" <?php echo $logVoice == '1' ? 'checked' : ''; ?>>
                            Log Voice Channel Activity
                        </label>
                    </div>

                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="log_moderation" value="1" <?php echo $logModeration == '1' ? 'checked' : ''; ?>>
                            Log Moderation Actions
                        </label>
                    </div>

                    <div class="form-group">
                        <label>Log Retention (days)</label>
                        <input type="number" name="log_retention_days"
                            value="<?php echo htmlspecialchars($logRetention); ?>" min="1" max="365">
                        <small>Logs older than this will be automatically deleted</small>
                    </div>
                </div>

                <div class="settings-section">
                    <h2>🤖 Bot Information</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Client ID:</span>
                            <span class="info-value">
                                <?php echo DISCORD_CLIENT_ID; ?>
                            </span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Guild ID:</span>
                            <span class="info-value">
                                <?php echo GUILD_ID; ?>
                            </span>
                        </div>
                    </div>
                </div>

                <button type="submit" name="submit" class="btn-primary">💾 Save Settings</button>
            </form>
        </div>
    </div>

    <style>
        .alert {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }

        .alert.success {
            background: rgba(46, 204, 113, 0.2);
            border: 1px solid #2ecc71;
            color: #2ecc71;
        }

        .settings-section {
            margin-bottom: 2rem;
        }

        .settings-section h2 {
            color: #8a2be2;
            margin-bottom: 1rem;
        }

        .form-group label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .form-group input[type="checkbox"] {
            width: auto;
        }

        .form-group small {
            display: block;
            color: #777;
            margin-top: 0.5rem;
        }

        .info-grid {
            display: grid;
            gap: 1rem;
        }

        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 5px;
        }

        .info-label {
            color: #b19cd9;
        }

        .info-value {
            color: white;
            font-family: monospace;
        }
    </style>
</body>

</html>