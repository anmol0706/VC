# MeetUp - Mobile-First Video Calling App

A Google Meet-style video calling application optimized for mobile devices. Built with React, WebRTC, and Socket.IO.

![MeetUp](https://via.placeholder.com/800x400/0f0f1a/3b82f6?text=MeetUp+Video+Calls)

## ✨ Features

- 📱 **Mobile-First Design** - Optimized for portrait mode with safe-area support
- 🎥 **WebRTC Video Calls** - Peer-to-peer, low-latency video/audio
- 👥 **2-4 Participants** - Support for small group calls
- 🔗 **Easy Room Sharing** - Create rooms with one tap, share via link
- 🎛️ **Full Controls** - Mute, camera toggle, camera switch, end call
- 🖼️ **Floating PiP** - Draggable self-view picture-in-picture
- 👆 **Tap-to-Focus** - Click any participant to view full-screen
- 🌙 **Dark Theme** - Beautiful dark UI with glassmorphism effects
- 🔄 **Auto-Reconnect** - Graceful handling of network issues

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express, Socket.IO |
| Real-time | WebRTC (peer-to-peer media) |
| Signaling | Socket.IO (room management) |

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── Home.jsx    # Landing page
│   │   │   ├── Room.jsx    # Video call room
│   │   │   ├── Controls.jsx
│   │   │   ├── PiP.jsx
│   │   │   └── VideoGrid.jsx
│   │   ├── hooks/          # Custom React hooks
│   │   │   ├── useSocket.js
│   │   │   ├── useWebRTC.js
│   │   │   └── useMediaDevices.js
│   │   └── index.css       # Tailwind + custom styles
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js            # Express + Socket.IO server
│   ├── roomManager.js      # Room state management
│   └── package.json
└── .env.example
```

## 🚀 Local Development Setup

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Step 1: Clone & Install

```bash
# Navigate to project
cd anmol-protfolio

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Start the Server

```bash
# From the server directory
cd server
npm run dev

# Server will start on http://localhost:3001
```

### Step 3: Start the Client

```bash
# From the client directory (in a new terminal)
cd client
npm run dev

# Client will start on http://localhost:5173
```

### Step 4: Test the App

1. Open `http://localhost:5173` in your browser
2. Click "Create Room" to generate a room
3. Copy the room link
4. Open the link in another browser/tab/device
5. Both participants should see each other!

> **Tip:** For mobile testing, use your computer's local IP instead of localhost (e.g., `http://192.168.1.100:5173`)

## 📱 Mobile Testing

To test on a real mobile device:

1. Find your computer's local IP:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig` or `ip addr`

2. Update the client to use your IP:
   ```bash
   # In client directory, create .env file
   echo "VITE_SERVER_URL=http://YOUR_IP:3001" > .env
   ```

3. Restart the dev server

4. On your phone, open `http://YOUR_IP:5173`

> **Note:** Both devices must be on the same network.

## 🌐 Deployment

### Client → Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Set root directory to `client`
4. Add environment variable:
   - `VITE_SERVER_URL` = `https://your-server.onrender.com`
5. Deploy!

### Server → Render

1. Go to [render.com](https://render.com)
2. Create a new "Web Service"
3. Connect your GitHub repo
4. Configure:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variable:
   - `CLIENT_URL` = `https://your-app.vercel.app`
6. Deploy!

## 🔧 Environment Variables

Create `.env` files based on `.env.example`:

**Client (`client/.env`):**
```
VITE_SERVER_URL=http://localhost:3001
```

**Server (`server/.env`):**
```
PORT=3001
CLIENT_URL=http://localhost:5173
```

## 📝 How It Works

```
┌─────────────┐    Socket.IO    ┌─────────────┐
│   User A    │◄──────────────►│   Server    │
│  (Browser)  │                 │  (Node.js)  │
└──────┬──────┘                 └──────┬──────┘
       │                               │
       │ WebRTC (P2P)                  │ Socket.IO
       │ Video/Audio                   │ Signaling
       ▼                               ▼
┌─────────────┐    Socket.IO    ┌─────────────┐
│   User B    │◄──────────────►│   Server    │
│  (Browser)  │                 │  (Node.js)  │
└─────────────┘                 └─────────────┘
```

1. **Signaling Server** (Socket.IO) - Helps users find each other and exchange connection info
2. **WebRTC** - Direct peer-to-peer video/audio streaming (no server in the middle!)
3. **STUN Servers** - Help with NAT traversal (we use Google's free STUN servers)

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Camera not working | Check browser permissions |
| Can't connect to other users | Ensure both are on same network or use TURN server |
| Server not starting | Check if port 3001 is available |
| Black video | Try switching cameras or reloading |

## 📄 License

MIT - Feel free to use this for learning or building your own video calling app!

---

Built with ❤️ for mobile-first experiences
