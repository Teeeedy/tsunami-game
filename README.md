# TSUNAMI 🌊 — Multiplayer Trivia Card Game

A real-time multiplayer web game where players answer trivia questions to earn card flips on a shared 5×5 board. Cards manipulate scores through gains, losses, steals, and rare powerful effects.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)

## How to Play

1. **Create or Join** a lobby using a 5-letter room code
2. **Customize** trivia questions and game settings (host only)
3. **Answer** trivia questions — first correct answer picks a card
4. **Flip cards** on the 5×5 board to gain, lose, steal, or trigger special effects
5. **Win** by having the highest score when all 25 cards are revealed

## Card Types

| Card | Count | Effect |
|------|-------|--------|
| Gain 50/100/200 | 7 | Add points to your score |
| Lose 50/100/200 | 7 | Subtract points from your score |
| Steal 100/200 | 5 | Take points from another player |
| Double Next | 2 | Next card's effect is doubled |
| Reverse Next | 1 | Next card's effect is reversed |
| TSUNAMI | 2 | Halve a chosen player's points |
| Swap Points | 1 | Exchange scores with another player |

## Tech Stack

- **Frontend:** React 19 + Vite + TailwindCSS v4 + Framer Motion
- **Backend:** Node.js + Express + Socket.IO
- **State:** Zustand
- **Deployment:** Render (single web service)

## Local Development

### Prerequisites
- Node.js 18+
- npm

### Setup

```bash
# Install all dependencies
npm install
cd client && npm install && cd ..

# Start the backend server (port 3001)
npm start

# In another terminal, start the frontend dev server (port 5173)
cd client && npm run dev
```

Open `http://localhost:5173` — the Vite dev server proxies Socket.IO to port 3001.

### Production Build

```bash
# Build the client
cd client && npm run build && cd ..

# Start the server (serves the built client)
npm start
```

Open `http://localhost:3001`.

## Deploy to Render

### Option 1: Render Blueprint
1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
3. Connect your repo — Render reads `render.yaml` automatically

### Option 2: Manual Setup
1. **New Web Service** on Render
2. **Build Command:** `npm install && cd client && npm install && npm run build`
3. **Start Command:** `node server/index.js`
4. **Environment:** Node

Render automatically sets the `PORT` environment variable.

## Project Structure

```
tsunami-game/
├── server/
│   ├── index.js        # Express + Socket.IO server
│   ├── rooms.js        # Room/lobby management
│   ├── gameLogic.js    # Card deck, effects, scoring
│   ├── trivia.js       # Trivia system + default questions
│   └── sockets.js      # WebSocket event handlers
├── client/
│   └── src/
│       ├── App.jsx             # Router + Socket.IO listeners
│       ├── pages/              # Home, Lobby, Game, End screens
│       ├── store/              # Zustand state
│       └── utils/socket.js     # Socket.IO client
├── render.yaml         # Render deployment blueprint
└── package.json        # Root scripts
```

## Features

- ✅ Real-time multiplayer via WebSockets
- ✅ Custom trivia questions (host-created)
- ✅ 35 built-in fallback trivia questions
- ✅ Host-configurable settings (points, timer, max players)
- ✅ Card flip animations (Framer Motion)
- ✅ Modifier cards (Double & Reverse) with stacking
- ✅ Interactive targeting (Steal, TSUNAMI, Swap)
- ✅ Anti-cheat server-side validation
- ✅ Responsive dark-mode UI
- ✅ Render-ready deployment

## License

MIT
