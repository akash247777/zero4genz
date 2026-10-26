# TAKRAAR (तक्रार)
### The Duplex Multilingual Argument Engine

> *"Two people who don't share a single language need to have an argument. A real one: interrupting each other, getting heated, changing their minds. Build the thing that lets them."*

---

## Deploying to Vercel

The project is fully configured and ready for 1-click deployment on **Vercel** with:
- `vercel.json` configured with proper rewrites and clean URLs.
- Serverless API endpoints in `/api/health.js` and `/api/room.js` for cross-device message synchronization.
- 0ms cross-tab duplex synchronization via `BroadcastChannel` (two browser windows on the same device can argue with 0ms latency).

### Method 1: Deploy via GitHub (Recommended)
1. Push this project to your GitHub account:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/takraar.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `takraar` repository.
4. Leave all build and output settings as default (Framework Preset: **Other**).
5. Click **Deploy**. Your app will be live at `https://your-project.vercel.app` in under 30 seconds!

### Method 2: Deploy directly via Vercel CLI
```bash
# Run in the project directory:
npx vercel
```
Follow the quick CLI prompts:
- *Set up and deploy?* **Y**
- *Which scope?* Select your account
- *Link to existing project?* **N**
- *Project name?* `takraar`
- *In which directory is your code located?* `./`
- *Want to modify these settings?* **N**

---

## Why Existing Translators Fail at Arguments

Every speech translation tool in existence today (Google Translate, Apple Translate, DeepL, walkie-talkie mode) is designed for **polite transactions** ("Where is the train station?", "Check, please"):
1. **Half-Duplex Gatekeeping:** If Speaker A talks, Speaker B is muted. If Speaker B tries to interrupt, the audio clips or the app fails.
2. **Turn-Taking Latency:** Waiting 3 to 5 seconds after a sentence finishes kills the momentum of an argument.
3. **Sterilized Emotion:** Intense colloquial accusations ("Yeh sab bakwaas hai!") get translated into polite, flat corporate English ("This is completely unreasonable").
4. **No Mind-Shift Tracking:** Real arguments do not last forever—they either end in rupture or resolution. Normal tools have zero awareness of when someone conceded a point or changed their mind.

---

## What We Built: TAKRAAR Engine

TAKRAAR is a full-duplex, sub-second confrontation engine built with:
- **Duplex Interruption Architecture:** Both audio channels are hot simultaneously. When Speaker B talks over Speaker A, Speaker A's translation is cut off mid-sentence with an immediate visual strike-through (`[CUT OFF ⚡]`), ducked audio, and Speaker B's retort surges into the floor.
- **Tension & Heat Meter (0 to 100°C):** Real-time emotional telemetry driven by acoustic loudness, speech rate (WPM), interruption frequency, and confrontational lexical markers.
- **Sub-Second Speculative Streaming:** Live streaming words and speculative translations as they are being uttered, so the listener reads the retort before the speaker even finishes exhaling.
- **Mind-Shift & Concession Detector:** Real-time semantic extraction of concessions ("Wait... what AWS crash?", "Ruko, let me check the logs", "Fair point, my mistake"). It logs the exact moment minds pivot and synthesizes an emerging **Common Ground** contract.
- **Emotionally Pitch-Shifted Synthesis:** Text-To-Speech dynamically modulates rate (up to 1.25x) and pitch to reflect agitation and de-escalation.

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the duplex server
node server.js

# 3. Open in browser
http://localhost:3000
```

### Pre-loaded High-Voltage Scenarios
1. **Startup Equity & Midnight Outage:** Kabir (CTO, Hindi) vs Alex (CEO, English) — 15% equity slash dispute resolved via AWS us-east-1 incident proof.
2. **Udaipur Wedding Muhurat Catastrophe:** Mrs. Sharma (Hindi) vs Marcus (British Planner) — 300 early guests clashing with banquet contracts, resolved via Heritage Courtyard compromise.
3. **Agency Scope Creep Brawl:** Mateo (Designer, Spanish) vs Rachel (VP Product, English) — 18 unbilled revisions resolved via SOW contract check and a $5k change order.
