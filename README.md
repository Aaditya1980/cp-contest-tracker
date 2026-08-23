<div align="center">

# 🏆 CodePulse — CP Contest Tracker

### *Never Miss a Contest Again. Real-Time CP Tracker + Google Calendar Sync + Desktop App.*

[![GitHub Stars](https://img.shields.io/github/stars/Aaditya1980/cp-contest-tracker?style=for-the-badge&color=06b6d4)](https://github.com/Aaditya1980/cp-contest-tracker/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Aaditya1980/cp-contest-tracker?style=for-the-badge&color=3b82f6)](https://github.com/Aaditya1980/cp-contest-tracker/network/members)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/new/clone?repository-url=https://github.com/Aaditya1980/cp-contest-tracker)

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-google-calendar-integration">Calendar Sync</a> •
  <a href="#-supported-platforms">Platforms</a> •
  <a href="#-desktop-app--pwa">Desktop App</a>
</p>

</div>

---

## ⚡ What is CodePulse?

**CodePulse** is an ultra-fast, feature-packed Competitive Programming Contest Tracker designed for coders worldwide. It aggregates upcoming and ongoing contests live from **Codeforces**, **LeetCode**, **CodeChef**, **AtCoder**, and **HackerRank**, provides 1-click **Google Calendar** integration, downloads **.ics calendar files with alarms**, and sends **desktop push reminders** right before the contest starts!

```
 🏆 CODEPULSE LIVE
 ├── 🔹 Codeforces API (Official REST endpoint)
 ├── 🔸 LeetCode GraphQL (TopTwoContests live feed)
 ├── 📙 CodeChef API (Official contest list API)
 ├── 🟩 AtCoder & HackerRank (Seed & Clist Aggregator)
 └── 📅 1-Click Google Calendar Sync & .ics Export
```

---

## 🔥 Key Features

- 🚀 **Multi-Platform API Fetchers**: Direct live integration with official APIs for zero latency & maximum reliability.
- 📅 **1-Click Google Calendar Sync**: Instantly opens pre-filled Google Calendar events with title, start/end dates, contest link, and 30-min alarm.
- 📥 **iCal (.ics) Download**: Stream standard calendar files with embedded `VALARM` triggers compatible with Apple Calendar, Outlook, and Google.
- ⏱️ **Live T-Minus Countdown Ticker**: Real-time dynamic clock showing Days, Hours, Minutes, and Seconds until contest start.
- 🔔 **Smart Reminders**: Desktop push notifications + audio chime alerts 30m, 15m, or 5m before contest start.
- 🌍 **Multi-Timezone Engine**: Switch between IST, UTC, EST, PST, CET, JST, or your auto-detected local timezone.
- 🔖 **Bookmark System**: Save your favorite contests to local storage for quick access.
- 💻 **Standalone Desktop App & PWA**: Launch as a native Windows desktop app window via `launch-app.bat` or install via browser.

---

## 🎨 Supported Competitive Programming Platforms

| Platform | Neon Badge | Live Integration |
| :--- | :---: | :--- |
| **Codeforces** | `![Codeforces](https://img.shields.io/badge/Codeforces-3182CE?style=flat-square&logo=codeforces&logoColor=white)` | Official `codeforces.com/api/contest.list` |
| **LeetCode** | `![LeetCode](https://img.shields.io/badge/LeetCode-FFA116?style=flat-square&logo=leetcode&logoColor=black)` | Official GraphQL `leetcode.com/graphql` |
| **CodeChef** | `![CodeChef](https://img.shields.io/badge/CodeChef-5B4638?style=flat-square&logo=codechef&logoColor=white)` | Official `codechef.com/api/list/contests/all` |
| **AtCoder** | `![AtCoder](https://img.shields.io/badge/AtCoder-000000?style=flat-square&logo=atcoder&logoColor=white)` | Direct Feed Aggregator |
| **HackerRank** | `![HackerRank](https://img.shields.io/badge/HackerRank-00EA64?style=flat-square&logo=hackerrank&logoColor=black)` | Direct Feed Aggregator |

---

## 🛠️ Quick Start (Local Setup)

### Prerequisites
- Node.js v18+ installed

### 1. Clone & Install
```bash
git clone https://github.com/Aaditya1980/cp-contest-tracker.git
cd cp-contest-tracker
npm install
```

### 2. Run Full-Stack Server
```bash
node server.js
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser!

### 3. Run Frontend Hot-Reloading Dev Mode
```bash
npm run dev
```

---

## 💻 Desktop App Launcher (Windows)

CodePulse includes a standalone Windows Desktop Launcher script!

1. Double-click **`launch-app.bat`** in the project folder.
2. CodePulse launches in a dedicated app window with its own taskbar icon!

---

## ☁️ 1-Click Cloud Deployment

Deploy CodePulse to Vercel in 1 click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Aaditya1980/cp-contest-tracker)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>Built with ❤️ for Competitive Programmers worldwide. Star ⭐ this repository if you find it helpful!</sub>
</div>
