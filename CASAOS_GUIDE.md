# 🚀 CasaOS Deployment Guide for Digital Den Bot (Web GUI Method)

Since your repository is public, you can install the bot on CasaOS directly from your GitHub URL using the Web GUI. You do not need to copy files or log into a terminal.

---

## 📋 Prerequisites

Before deploying, make sure you have:
1. A running **CasaOS** host.
2. A **Discord Application** created on the [Discord Developer Portal](https://discord.com/developers/applications).
3. The Discord Application credentials:
   - **Bot Token**
   - **Client ID** (Application ID)
   - **Client Secret**

---

## 📥 Install the Bot via CasaOS Web GUI (URL Method)

1. Open your **CasaOS Dashboard**.
2. Click **App Store**.
3. In the top-right corner of the App Store, click **Custom Install**.
4. In the installation window, click **Import** (represented by a folder/terminal icon in the top-right corner).
5. Paste the **Raw GitHub URL** of your `docker-compose.yml` file:
   ```text
   https://raw.githubusercontent.com/simplehima/digital-den/main/docker-compose.yml
   ```
   *(If your default branch is `master`, change `/main/` to `/master/`)*
6. Click **Submit**. CasaOS will download and parse the configuration from GitHub automatically.
7. Under the **Environment** section, fill in the following fields:
   - `DISCORD_TOKEN`: Your Discord Bot Token.
   - `CLIENT_ID`: Your Discord Client/Application ID.
   - `CLIENT_SECRET`: Your Discord Client Secret.
   - `REDIRECT_URI`: Set this to `http://<YOUR_CASAOS_IP>:<PORT>/auth/callback` (replace with your server's details).
   - `SESSION_SECRET`: Set to any long random string.
   - `GUILD_ID`: Optional. Set to your Discord Server ID to register commands instantly.

8. Under the **Volumes** section, map `/app/logs` to a persistent path on your host (e.g., `/DATA/AppData/digital-den-bot/logs`) so that your bot logs are saved.
9. Click **Install** to deploy and run the bot!

---

## 🌐 Configure Discord Developer Portal

For the web dashboard's Discord login (OAuth2) to function:

1. Open the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click on your application and navigate to the **OAuth2** tab.
3. Under **Redirects**, click **Add Redirect**.
4. Enter the same redirect URI you set in the CasaOS environment variables:
   ```text
   http://<YOUR_CASAOS_IP>:<PORT>/auth/callback
   ```
   *(For example: `http://192.168.1.100:3000/auth/callback`)*
5. Click **Save Changes** at the bottom of the page.

---

## 🔄 How Updates Work
Whenever you make changes to your code and push to the `main` or `master` branch on GitHub:
1. GitHub Actions will automatically rebuild the container and push the new version to `ghcr.io`.
2. To update the bot on your CasaOS server:
   - Click the three dots on the app card in the CasaOS dashboard.
   - Select **Settings**.
   - Click **Save** (this will pull the latest `ghcr.io` image and restart the container automatically).
