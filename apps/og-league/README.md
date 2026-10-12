# 🔮 OG League Live — Standalone Mobile Web App

A fast, lightweight, view-only mobile web app built specifically for your active 12-person NFL prediction league.

Designed to give your league members an immediate, beautiful mobile experience on iOS and Android while we continue developing the full interactive platform in `Main Project/`.

---

## ⚡ Key Highlights

- **Zero Auth Friction**: No logins, passwords, or account setups required. League members simply open the link on their phones.
- **Direct Live Sync with Google Sheets**: Queries the live Google Sheet in real time via the Google Visualization CSV API. As soon as you enter a score or pick in your sheet, members see it updated.
- **Instant Offline Fallback**: Pre-seeded with baseline data in `data.js` and cached in browser `localStorage`. Loads in under 0.2 seconds even on weak cellular networks.
- **Mobile-First PWA**: Configured with `manifest.json` and iOS web app meta tags. Members can tap **"Add to Home Screen"** in Safari / Chrome for a native app feel.
- **Completely Isolated**: Lives 100% inside `OG League Live/` without touching or depending on any files in `Main Project/`.

---

## 📱 Features & Views

### 1. 🏆 Standings (Leaderboard)
- **Top 3 Podium**: Visual Olympic-style podium celebrating Rank #1 (Gold crown), Rank #2 (Silver), and Rank #3 (Bronze).
- **Full Roster (1–12)**: Shows all 12 contenders with color-coded avatar badges, season points, and weekly points earned.
- **Interactive**: Tap any player's card to jump straight into their individual scorecard.

### 2. 🏈 Matchups & Picks
- **Live Matchup Cards**: Displays all 16 games for any selected week (Thursday Night, Sunday early/late, Sunday Night, Monday Night).
- **Game Status**: Clear `FINAL`, `LIVE`, or `SCHEDULED` status tags.
- **Picks Breakdown Grid**: Shows what all 12 league members picked for every game:
  - Picked winner & predicted score (e.g. `ATL 27-24`).
  - ⭐ **3x Confidence Multiplier** badges.
  - Points awarded (+10 for winner, +30 for multiplier winner, +50 for exact score, +150 for exact score multiplier).
  - Color-coded borders: Gold glow for exact score hits, Green for winning picks, muted for incorrect/pending.

### 3. 👤 Players (Roster Scorecards)
- Filter by any of the 12 players: **Jon, Alisha, Carson, Nok, Mango, Caleb, Ross, Dishman, Ethan, Brett, Wells, Rob**.
- **Hero Card**: Displays player avatar, current season rank, total season points, selected week points, and correct pick accuracy.
- **Detailed Game-by-Game Table**: Shows their prediction, score, actual final score, and points for each game in the selected week.

### 4. 📊 NFL Standings & Playoff Picture
- Real-time AFC & NFC Playoff seeds (1 through 7) with #1 seeds marked for first-round Byes.
- NFL Division standings for all 8 divisions with current W-L records.

### 5. 📜 Rules & Scoring
- Quick reference explaining:
  - Winner Pick: **+10 PTS**
  - Weekly 3x Multiplier: **3X PTS** (One designated game per week)
  - Exact Score Hit: **+50 PTS** (or **+150 PTS** on a multiplier!)

---

## 🚀 How to Host & Share with Your League in 1 Minute

Because `OG League Live` is 100% client-side HTML, CSS, and vanilla JS, it can be hosted instantly for free:

### Option A: GitHub Pages (Recommended)
1. Push this folder to a GitHub repository (e.g., `github.com/your-username/og-league`).
2. Go to **Settings > Pages**.
3. Under **Branch**, select `main` (or root) and click **Save**.
4. Send the generated link (e.g. `https://your-username.github.io/og-league/`) to your league group chat!

### Option B: Netlify Drop (30 Seconds, No Git Needed)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the `OG League Live` folder onto the webpage.
3. You get an instant live HTTPS link to send to your league members immediately.

### Option C: Vercel
1. Run `npx vercel` inside `OG League Live/`, or connect the repo to Vercel.

---

## 📲 How League Members Install It on Their Phones

- **iPhone (Safari)**:
  1. Open the link in Safari.
  2. Tap the **Share** button (box with upward arrow at bottom).
  3. Scroll down and tap **"Add to Home Screen"**.
- **Android (Chrome)**:
  1. Open the link in Chrome.
  2. Tap the three dots (⋮) in the top-right.
  3. Tap **"Add to Home screen"** or **"Install App"**.
