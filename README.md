# Sprachium Growth OS — Deployment Guide

Complete setup takes about 10–15 minutes. Do this once and the app is yours forever.

---

## What you'll have when done

- A real web app URL (e.g. `https://yourusername.github.io/sprachium-os`)
- Installable on your phone like a native app (PWA)
- AI advisor powered directly by Claude
- Progress syncs to your own Google Sheet — access from any device

---

## STEP 1 — Get your Anthropic API Key (free)

1. Go to https://console.anthropic.com
2. Sign up / log in
3. Click **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-`)
5. Save it somewhere safe — you'll need it during setup

> Note: Anthropic gives free credits to new accounts. The OS is very efficient — daily use costs fractions of a cent.

---

## STEP 2 — Set up Google Sheets backend (for cross-device sync)

1. Go to https://sheets.google.com → create a **new blank spreadsheet**
2. Name it **Sprachium OS**
3. Click **Extensions** → **Apps Script**
4. Delete all the default code in the editor
5. Open the file `sheets-backend.gs` from this folder and paste ALL of it into the Apps Script editor
6. Click **Save** (disk icon)
7. Click **Deploy** → **New deployment**
8. Set type to **Web app**
9. Set **Execute as**: Me
10. Set **Who has access**: Anyone
11. Click **Deploy**
12. Copy the **Web app URL** — it looks like `https://script.google.com/macros/s/AKf.../exec`

> Keep this URL private — it's your personal data endpoint.

---

## STEP 3 — Deploy the app to GitHub Pages (free hosting)

### 3a — Create a GitHub account
- Go to https://github.com and sign up (free)

### 3b — Create a new repository
1. Click the **+** button → **New repository**
2. Name it: `sprachium-os`
3. Set it to **Public**
4. Click **Create repository**

### 3c — Upload the files
1. In your new repo, click **uploading an existing file**
2. Upload everything in this folder:
   - `index.html`
   - `manifest.json`
   - `css/style.css`
   - `js/app.js`
   - The `icons/` folder (if you have icons — skip if not)
3. Click **Commit changes**

### 3d — Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **main** branch and **/ (root)**
3. Click **Save**
4. Wait 1–2 minutes, then your URL will appear:
   `https://yourusername.github.io/sprachium-os`

---

## STEP 4 — First launch & setup

1. Open your GitHub Pages URL in any browser
2. Enter your **Anthropic API key** (from Step 1)
3. Enter your **Google Sheets Web App URL** (from Step 2)
4. Click **Save & Start**

The app loads with Day 1 and you're live.

---

## STEP 5 — Install as an app on your phone (optional but recommended)

### iPhone / iPad:
1. Open the URL in Safari
2. Tap the **Share** button → **Add to Home Screen**
3. Tap **Add**

### Android:
1. Open the URL in Chrome
2. Tap the **three dots** menu → **Add to Home screen**
3. Tap **Add**

The app now opens full-screen like a native app.

---

## Daily use

- Open the URL (or your home screen icon) every day
- The day counter increments once per calendar day automatically
- Use the **Create**, **Plan**, **Research**, **Course**, **Monetize**, **Help** modules
- Log completed tasks in the **Review** module — this syncs to your Google Sheet
- The Google Sheet keeps a full history of every session

---

## Updating the app

When you want to add features or fix something:
1. Edit the files locally
2. Go to your GitHub repo → click the file → click the **pencil** (edit) icon
3. Paste the updated content → **Commit changes**
4. GitHub Pages updates automatically within 1–2 minutes

---

## Troubleshooting

| Problem | Fix |
|---|---|
| API errors | Check your API key in Settings. Make sure you have credits at console.anthropic.com |
| Sheets not syncing | Re-deploy your Apps Script (Step 2). Make sure access is set to "Anyone" |
| App not updating | Clear browser cache or do a hard refresh (Ctrl+Shift+R) |
| Day counter wrong | Go to Settings → override the day number manually |

---

## File structure

```
sprachium-os/
├── index.html          ← Main app
├── manifest.json       ← PWA config
├── sheets-backend.gs   ← Google Apps Script (paste into Apps Script, not uploaded to GitHub)
├── css/
│   └── style.css       ← All styles
├── js/
│   └── app.js          ← All logic + Claude API calls
└── icons/
    ├── icon-192.png    ← App icon (optional, create in Canva: 192×192px, navy bg, teal S)
    └── icon-512.png    ← App icon (optional, same but 512×512px)
```

---

Built for M. Khalid Junaid · Sprachium · B2 Goethe-Zertifikat
