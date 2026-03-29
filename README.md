# Real-Time Multiplayer Chess ♟️📱

A full-stack, real-time multiplayer chess application built for mobile. This project demonstrates bidirectional, low-latency communication between a React Native frontend and a Django backend using WebSockets. 

Players can generate unique room codes to instantly pair up across different devices, with the server acting as the source of truth for role assignment and move validation.

## ✨ Features
* **Real-Time WebSockets:** Sub-50ms move broadcasting using Django Channels.
* **Room-Based Matchmaking:** Isolated game sessions generated via custom room codes.
* **Server-Side State Management:** The Python backend dynamically assigns "White" and "Black" roles based on connection order.
* **Strict Move Validation:** Frontend gatekeeping ensures players can only interact with their assigned pieces, powered by `chess.js`.
* **Cross-Platform:** Runs flawlessly on both iOS and Android via Expo.

## 🛠️ Tech Stack
**Frontend (Mobile App)**
* React Native (Expo)
* TypeScript
* `react-native-chessboard` (Interactive UI)
* `chess.js` (Game logic & FEN state management)

**Backend (WebSocket Server)**
* Python
* Django & Django Channels
* Daphne (ASGI Server)

---

## 🚀 How to Run Locally

To test this project on your own machine, you will need to run both the Python backend and the Expo frontend simultaneously.

### 1. Start the Django Server
Open a terminal and navigate to your backend folder.
```bash
# Install required dependencies
pip install django channels daphne

# Run the ASGI server (Listens on all network interfaces)
daphne -b 0.0.0.0 -p 8000 backend.asgi:application
```
*Note: Keep this terminal open to maintain the WebSocket connection.*

### 2. Configure the Frontend IP
Because the mobile app needs to find your local server over your Wi-Fi network, you must update the WebSocket URL.
1. Find your computer's local IPv4 address (run `ipconfig` on Windows or `ifconfig` on Mac/Linux).
2. Open `app/(tabs)/index.tsx` in the frontend folder.
3. Locate the `connectToRoom` function and replace the IP with your actual IPv4 address:
   ```typescript
   const serverUrl = `ws://YOUR_IPV4_ADDRESS:8000/ws/chess/${roomName}/`;
   ```

### 3. Start the React Native App
Open a *second* terminal and navigate to your frontend folder.
```bash
# Install node modules
npm install

# Start the Expo development server (clearing cache for safety)
npx expo start -c
```
Scan the generated QR code with the Expo Go app on your phone, or press `w` to open it in your web browser. Join the same room code on two different devices to play!
```
