# YouTube Cookies Guide

## Why Cookies Are Needed

YouTube has bot detection that blocks automated access. By providing your browser cookies, the bot can bypass these restrictions and play YouTube videos reliably.

## Security Notice

> [!WARNING]
> **Cookie Security**: Your cookies contain authentication data. Never share your `cookies.txt` file publicly or commit it to git. The `.gitignore` file is already configured to exclude it.

---

## How to Get YouTube Cookies

### Method 1: Browser Extension (Recommended)

#### For Chrome/Edge/Brave:
1. Install **"Get cookies.txt LOCALLY"** extension:
   - [Chrome Web Store Link](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)

2. Go to [YouTube.com](https://youtube.com)

3. Make sure you're **logged in** to your YouTube account

4. Click the extension icon in your toolbar

5. Click **"Export"** or **"Download"**

6. Save the file as `cookies.txt` in your bot directory:
   ```
   d:\Github Repos\Hima The Musician\cookies.txt
   ```

#### For Firefox:
1. Install **"cookies.txt"** add-on:
   - [Firefox Add-ons Link](https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/)

2. Follow steps 2-6 above

---

### Method 2: Manual Export (Advanced)

If you can't use extensions:

1. Open YouTube in your browser and log in

2. Press `F12` to open Developer Tools

3. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)

4. Click **Cookies** → `https://www.youtube.com`

5. Copy all cookies and format them as Netscape cookie format

> [!NOTE]
> This method is complex and error-prone. Using the browser extension is strongly recommended.

---

## File Location

Place your `cookies.txt` file in the bot's root directory:

```
Hima The Musician/
├── cookies.txt          ← Place here
├── cookies.txt.example  ← Example file (don't edit)
├── index.js
├── package.json
└── ...
```

---

## Verifying Cookies Work

1. Start the bot:
   ```bash
   node index.js
   ```

2. Look for this message in the console:
   ```
   [MUSIC] YouTube cookies loaded successfully
   ```

3. If you see this instead:
   ```
   [MUSIC] No cookies.txt found - YouTube may have restrictions
   ```
   Then the file is missing or in the wrong location.

4. Test with `/play` command:
   ```
   /play https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```

   If it works without "Sign in to confirm" errors, your cookies are working!

---

## Troubleshooting

### "No cookies.txt found"
- Make sure the file is named exactly `cookies.txt` (not `cookies.txt.txt`)
- Place it in the bot's root directory (same folder as `index.js`)

### "Failed to load cookies"
- Check the file format - it should be Netscape format
- Re-export cookies from the browser extension
- Make sure you're logged in to YouTube when exporting

### "Sign in to confirm you're not a bot" error
- Your cookies may be expired - export fresh ones
- Make sure you exported cookies from YouTube.com, not another site

### Still Not Working?
- Try logging out and back in to YouTube
- Clear your browser cookies and log in fresh, then export again
- Try a different browser

---

## Cookie Expiration

YouTube cookies typically expire after:
- **Session cookies**: When you close the browser
- **Persistent cookies**: 1-2 years

If the bot stops working after a while:
1. Export fresh cookies
2. Replace the old `cookies.txt` file
3. Restart the bot

---

## Deployment to Hostinger

When deploying to Hostinger:

1. **Export cookies** from your browser

2. **Upload to server** via SFTP/File Manager:
   ```
   /home/username/public_html/cookies.txt
   ```

3. **DO NOT commit to git** - keep it local only

4. Restart the bot on the server

---

## Privacy & Security

- Cookies contain authentication tokens
- Anyone with your cookies can access your YouTube account
- Never share `cookies.txt` publicly
- Never commit to GitHub/Git
- Already added to `.gitignore` for safety

**Treat your `cookies.txt` like a password!**
