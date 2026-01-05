<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Digital Den - Discord Bot</title>
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon.png">
    <link rel="apple-touch-icon" href="assets/favicon.png">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: linear-gradient(135deg, #0f0f13 0%, #1a1a2e 100%);
            color: #ffffff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        header {
            background: rgba(0, 0, 0, 0.5);
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
            text-align: center;
            border: 2px solid #8a2be2;
            box-shadow: 0 0 20px rgba(138, 43, 226, 0.3);
        }

        h1 {
            font-size: 3rem;
            background: linear-gradient(45deg, #8a2be2, #da70d6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
        }

        .subtitle {
            color: #b19cd9;
            font-size: 1.2rem;
            margin-bottom: 20px;
        }

        .login-btn {
            display: inline-block;
            background: linear-gradient(135deg, #8a2be2, #6a1bb2);
            color: white;
            padding: 12px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            transition: all 0.3s;
            margin-top: 10px;
        }

        .login-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 20px rgba(138, 43, 226, 0.5);
        }

        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .card {
            background: rgba(30, 30, 40, 0.8);
            padding: 30px;
            border-radius: 15px;
            border: 1px solid #333;
            transition: all 0.3s;
        }

        .card:hover {
            transform: translateY(-5px);
            border-color: #8a2be2;
            box-shadow: 0 10px 30px rgba(138, 43, 226, 0.3);
        }

        .card h2 {
            color: #8a2be2;
            margin-bottom: 15px;
            font-size: 1.5rem;
        }

        .card ul {
            list-style: none;
            padding-left: 0;
        }

        .card li {
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card li:last-child {
            border-bottom: none;
        }

        .emoji {
            margin-right: 10px;
        }

        .commands {
            background: rgba(0, 0, 0, 0.3);
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #8a2be2;
        }

        .command-code {
            background: rgba(0, 0, 0, 0.5);
            padding: 2px 8px;
            border-radius: 4px;
            color: #da70d6;
            font-family: 'Courier New', monospace;
        }

        footer {
            text-align: center;
            padding: 20px;
            color: #777;
            margin-top: 50px;
        }
    </style>
</head>

<body>
    <div class="container">
        <header>
            <h1>🦊 The Digital Den</h1>
            <p class="subtitle">Your High-Tech Discord Sanctuary</p>
            <a href="auth.php" class="login-btn">🔐 Admin Login</a>
        </header>

        <div class="features">
            <div class="card">
                <h2>⚡ Features</h2>
                <ul>
                    <li><span class="emoji">🎮</span>Tech & Gaming Channels</li>
                    <li><span class="emoji">🎨</span>Creative Corner</li>
                    <li><span class="emoji">💬</span>Social Hangout Spaces</li>
                    <li><span class="emoji">🎙️</span>Voice Channels</li>
                    <li><span class="emoji">🛡️</span>Professional Moderation</li>
                </ul>
            </div>

            <div class="card">
                <h2>🎭 Roles</h2>
                <ul>
                    <li><span class="emoji">👑</span>Admin - Full Control</li>
                    <li><span class="emoji">🛡️</span>Moderator - Server Management</li>
                    <li><span class="emoji">🎙️</span>Voice Manager - Voice Control</li>
                    <li><span class="emoji">🎮</span>Gamer</li>
                    <li><span class="emoji">🎨</span>Artist</li>
                </ul>
            </div>

            <div class="card">
                <h2>🤖 Bot Status</h2>
                <ul>
                    <li><span class="emoji">✅</span>Bot Online</li>
                    <li><span class="emoji">📡</span>Slash Commands Ready</li>
                    <li><span class="emoji">🎨</span>Welcome Images Enabled</li>
                    <li><span class="emoji">🔒</span>Secure & Private</li>
                </ul>
            </div>
        </div>

        <div class="commands card">
            <h2>📋 Available Commands</h2>
            <ul>
                <li><span class="command-code">/help</span> - Show all commands</li>
                <li><span class="command-code">/rules</span> - View server rules</li>
                <li><span class="command-code">/serverinfo</span> - Server statistics</li>
                <li><span class="command-code">/userinfo</span> - User information</li>
                <li><span class="command-code">/avatar</span> - View user avatar</li>
                <li><span class="command-code">/ping</span> - Check bot latency</li>
                <li><span class="command-code">/setup</span> - Server setup (Owner only)</li>
                <li><span class="command-code">/announce</span> - Post announcement (Admin only)</li>
            </ul>
        </div>

        <footer>
            <p>🦊 The Digital Den © 2026 | A High-Tech Sanctuary for Gamers & Creators</p>
        </footer>
    </div>
</body>

</html>