<?php
require_once 'includes/auth.php';
require_once 'config.php';

$user = requireAuth();

// Handle announcement submission
$sent = false;
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // This would need bot API integration - for now save to file for bot to pickup
    $announcement = [
        'channel' => $_POST['channel'] ?? '',
        'title' => $_POST['title'] ?? '',
        'message' => $_POST['message'] ?? '',
        'color' => $_POST['color'] ?? '#8a2be2',
        'thumbnail' => $_POST['thumbnail'] ?? '',
        'image' => $_POST['image'] ?? '',
        'mention_roles' => $_POST['roles'] ?? [],
        'mention_everyone' => isset($_POST['mention_everyone']),
        'footer' => $_POST['footer'] ?? '',
        'timestamp' => time(),
        'author' => $user['username']
    ];

    file_put_contents(__DIR__ . '/data/pending_announcement.json', json_encode($announcement));
    $sent = true;
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Announcements - The Digital Den</title>
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon.png">
    <link rel="stylesheet" href="assets/dashboard.css">
</head>

<body>
    <?php include 'includes/nav.php'; ?>

    <div class="container">
        <h1>📢 Send Announcement</h1>

        <?php if ($sent): ?>
            <div class="alert success">
                ✅ Announcement queued! The bot will send it shortly.
                <br><small>Note: Run <code>node send-announcement.js</code> on server to dispatch.</small>
            </div>
        <?php endif; ?>

        <div class="announcement-layout">
            <div class="announcement-form card">
                <h2>✨ Compose Announcement</h2>

                <form method="POST" id="announcementForm">
                    <div class="form-group">
                        <label>📍 Channel</label>
                        <select name="channel" required>
                            <option value="announcements">📢 announcements</option>
                            <option value="general-chat">💭 general-chat</option>
                            <option value="rules">📜 rules</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>📝 Title</label>
                        <input type="text" name="title" id="title" placeholder="Announcement Title" required>
                    </div>

                    <div class="form-group">
                        <label>💬 Message</label>
                        <textarea name="message" id="message" rows="5" placeholder="Your announcement message..."
                            required></textarea>
                        <small>Supports Discord markdown: **bold**, *italic*, `code`, etc.</small>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>🎨 Embed Color</label>
                            <input type="color" name="color" id="color" value="#8a2be2">
                        </div>

                        <div class="form-group">
                            <label>🖼️ Thumbnail URL</label>
                            <input type="url" name="thumbnail" id="thumbnail" placeholder="https://...">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>📸 Large Image URL</label>
                        <input type="url" name="image" id="image" placeholder="https://...">
                        <small>Add a GIF or image to display in the announcement</small>
                    </div>

                    <div class="form-group">
                        <label>📎 Footer Text</label>
                        <input type="text" name="footer" id="footer" placeholder="Optional footer text">
                    </div>

                    <div class="mention-section">
                        <h3>📣 Mentions</h3>
                        <div class="mention-options">
                            <label class="checkbox-fancy">
                                <input type="checkbox" name="mention_everyone">
                                <span>@everyone</span>
                            </label>
                            <label class="checkbox-fancy">
                                <input type="checkbox" name="roles[]" value="admin">
                                <span>👑 Admin</span>
                            </label>
                            <label class="checkbox-fancy">
                                <input type="checkbox" name="roles[]" value="moderator">
                                <span>🛡️ Moderator</span>
                            </label>
                            <label class="checkbox-fancy">
                                <input type="checkbox" name="roles[]" value="member">
                                <span>👤 Member</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" class="btn-primary btn-large">
                        🚀 Send Announcement
                    </button>
                </form>
            </div>

            <div class="preview-section">
                <h2>👁️ Live Preview</h2>
                <div class="embed-preview card" id="preview">
                    <div class="embed-bar" id="previewBar"></div>
                    <div class="embed-content">
                        <div class="embed-thumbnail" id="previewThumb"></div>
                        <div class="embed-body">
                            <div class="embed-title" id="previewTitle">Announcement Title</div>
                            <div class="embed-description" id="previewMessage">Your message will appear here...</div>
                        </div>
                    </div>
                    <div class="embed-image" id="previewImage"></div>
                    <div class="embed-footer" id="previewFooter">
                        <span id="previewFooterText"></span>
                        <span id="previewTimestamp"></span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <style>
        .announcement-layout {
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: 2rem;
        }

        @media (max-width: 1024px) {
            .announcement-layout {
                grid-template-columns: 1fr;
            }
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 1rem;
        }

        .mention-section {
            background: rgba(0, 0, 0, 0.2);
            padding: 1.5rem;
            border-radius: 12px;
            margin: 1.5rem 0;
        }

        .mention-section h3 {
            margin-bottom: 1rem;
            color: var(--primary-light);
        }

        .mention-options {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .checkbox-fancy {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            background: var(--glass);
            border: 1px solid var(--glass-border);
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .checkbox-fancy:hover {
            border-color: var(--primary);
        }

        .checkbox-fancy input:checked+span {
            color: var(--primary-light);
        }

        .btn-large {
            width: 100%;
            padding: 1rem 2rem;
            font-size: 1.1rem;
            margin-top: 1rem;
        }

        /* Embed Preview */
        .embed-preview {
            background: #2f3136;
            border-radius: 4px;
            overflow: hidden;
            position: sticky;
            top: 100px;
        }

        .embed-bar {
            width: 4px;
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            background: #8a2be2;
            border-radius: 4px 0 0 4px;
        }

        .embed-content {
            display: flex;
            padding: 1rem;
            padding-left: 1.5rem;
            gap: 1rem;
        }

        .embed-thumbnail {
            width: 80px;
            height: 80px;
            border-radius: 4px;
            background-size: cover;
            background-position: center;
            flex-shrink: 0;
            display: none;
        }

        .embed-body {
            flex: 1;
        }

        .embed-title {
            font-weight: 600;
            font-size: 1rem;
            margin-bottom: 0.5rem;
            color: white;
        }

        .embed-description {
            color: #dcddde;
            font-size: 0.9rem;
            line-height: 1.4;
            white-space: pre-wrap;
        }

        .embed-image {
            width: 100%;
            max-height: 300px;
            background-size: cover;
            background-position: center;
            display: none;
        }

        .embed-footer {
            padding: 0.5rem 1rem 0.5rem 1.5rem;
            font-size: 0.75rem;
            color: #72767d;
            display: flex;
            justify-content: space-between;
        }

        .alert.success {
            background: rgba(46, 204, 113, 0.15);
            border: 1px solid rgba(46, 204, 113, 0.3);
            color: #22c55e;
            padding: 1rem;
            border-radius: 12px;
            margin-bottom: 2rem;
        }

        input[type="color"] {
            width: 60px;
            height: 40px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }
    </style>

    <script>
        // Live preview
        const title = document.getElementById('title');
        const message = document.getElementById('message');
        const color = document.getElementById('color');
        const thumbnail = document.getElementById('thumbnail');
        const image = document.getElementById('image');
        const footer = document.getElementById('footer');

        const previewTitle = document.getElementById('previewTitle');
        const previewMessage = document.getElementById('previewMessage');
        const previewBar = document.getElementById('previewBar');
        const previewThumb = document.getElementById('previewThumb');
        const previewImage = document.getElementById('previewImage');
        const previewFooterText = document.getElementById('previewFooterText');
        const previewTimestamp = document.getElementById('previewTimestamp');

        function updatePreview() {
            previewTitle.textContent = title.value || 'Announcement Title';
            previewMessage.textContent = message.value || 'Your message will appear here...';
            previewBar.style.background = color.value;

            if (thumbnail.value) {
                previewThumb.style.backgroundImage = `url(${thumbnail.value})`;
                previewThumb.style.display = 'block';
            } else {
                previewThumb.style.display = 'none';
            }

            if (image.value) {
                previewImage.style.backgroundImage = `url(${image.value})`;
                previewImage.style.display = 'block';
                previewImage.style.height = '200px';
            } else {
                previewImage.style.display = 'none';
            }

            previewFooterText.textContent = footer.value;
            previewTimestamp.textContent = new Date().toLocaleString();
        }

        title.addEventListener('input', updatePreview);
        message.addEventListener('input', updatePreview);
        color.addEventListener('input', updatePreview);
        thumbnail.addEventListener('input', updatePreview);
        image.addEventListener('input', updatePreview);
        footer.addEventListener('input', updatePreview);

        updatePreview();
    </script>
</body>

</html>