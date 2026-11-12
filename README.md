# ⌘ hotkey-it

> **Minimalist hotkey & muscle memory trainer for power users.**  
> Inspired by the distraction-free aesthetics and philosophy of Monkeytype, built specifically for mastering professional software keyboard shortcuts.

![hotkey-it Preview](public/assets/preview.png)

---

## ⚡ Features

- **🎯 Professional Software Packs**: Built-in curated shortcut packs for **VS Code**, **Figma**, **Blender 3D**, and **Excel / Sheets**.
- **🔥 Firebase Cloud Authentication**:
  - Email & Password registration & login.
  - 1-click Google and GitHub OAuth sign-in (`signInWithPopup`).
  - Choose your custom username and password after Google Sign-in to log in either via Google or Email/Password.
  - Real-time profile state sync via Firestore `onSnapshot`.
- **🏷️ Customizable Database Badges**:
  - User documents include a `badge` field in Firestore (empty by default).
  - Can be written directly in the Firebase Console (e.g. `🚀 Mythical`, `🔥 Grandmaster`).
  - Automatically renders as a sleek inline pill badge in the profile and global leaderboard.
- **🏆 100% Real Live Leaderboard**:
  - Live Firestore rankings with filtering (`Time 15`, `Time 60`, `10 Keys`, `25 Keys`, `All Packs`).
  - Columns: `#`, `name` with badges, `wpm / spm`, `accuracy`, `raw`, `consistency`, and `date`.
  - Zero mock or placeholder data.
- **📈 Chart.js & anime.js Visuals**:
  - Interactive Chart.js performance curve with detailed per-shortcut tooltips.
  - Smooth anime.js micro-animations on stat cards and keycap chord feedback.
  - FontAwesome iconography.
- **🎨 7 Themed Palettes**: Obsidian Minimal, Dracula, Nord Frost, Cyberpunk, Retro Beige, Matcha Moss, and Matrix Phosphor.
- **🔊 Procedural Switch Audio**: Real-time procedural mechanical keyboard switch synthesis via the Web Audio API (Clicky Blue, Tactile Brown, Linear Red, or Silent).
- **⏱️ Monotonic Continuous Timer**: Starts the instant you hit your first key and runs non-stop without resetting on keystrokes.
- **🖼️ Monkeytype-Style Scorecard Export**: Copies a 2x Retina PNG scorecard directly to the system clipboard (`ClipboardItem`) and displays a 3-second preview.

---

## 🚀 How to Host on GitHub Pages (2 Minutes Setup)

This repository includes a pre-configured automated deployment workflow: `.github/workflows/deploy.yml`.

### Step 1: Push Repository to GitHub
```bash
git init
git add .
git commit -m "Initial commit for hotkey-it"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hotkey-it.git
git push -u origin main
```

### Step 2: Add Secrets in GitHub Repository
1. Open your repository on GitHub.
2. Go to **Settings** ➔ **Secrets and variables** ➔ **Actions**.
3. Under **Repository secrets**, click **New repository secret** and add these values:

| Secret Name | Exact Value for this Project |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | `AIzaSyDOuTETTeDPZP7nZQhJdL6c7NZHSVFokz0` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `isentropic-outlook-lhl8x.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `isentropic-outlook-lhl8x` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `isentropic-outlook-lhl8x.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `1041765679136` |
| `VITE_FIREBASE_APP_ID` | `1:1041765679136:web:0d95cf0f396a37aa727c45` |
| `VITE_FIREBASE_DATABASE_ID` | `ai-studio-keyflow-116ecf1b-130a-4270-96b7-93f649db85ea` |

### Step 3: Enable GitHub Pages
1. In your GitHub repository, go to **Settings** ➔ **Pages**.
2. Under **Build and deployment** ➔ **Source**, select **GitHub Actions**.
3. That's it! GitHub will automatically run `.github/workflows/deploy.yml`, build the project with your secrets, and deploy it to `https://YOUR_USERNAME.github.io/hotkey-it/`.

---

## 🏷️ How to Assign User Badges in Firestore

1. Open [Firebase Console](https://console.firebase.google.com/).
2. Select your project: `isentropic-outlook-lhl8x`.
3. Go to **Firestore Database** ➔ database `ai-studio-keyflow-116ecf1b-130a-4270-96b7-93f649db85ea`.
4. Open the `users` collection and select any user document.
5. In the `badge` field (type `string`), enter any text you want:
   - Example: `🚀 Mythical`
   - Example: `🔥 Grandmaster`
   - Example: `⚡ Speed Demon`
6. Click **Save**. The badge will instantly appear in the user's profile, top navigation, and leaderboard!

---

## 🛠️ Local Development

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/hotkey-it.git
cd hotkey-it

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🎮 Game Controls & Hotkeys

| Shortcut | Action |
| :--- | :--- |
| `Tab + Enter` | Quick restart test |
| `Esc` | Reset to start / Close open modals |
| `?` | Open shortcut cheatsheet |
| Click `⌘ hotkey-it` logo | Instantly return to active trainer |

---

## 📄 License
MIT License. Free and open source for everyone.
