import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Chessboard, { ChessboardRef } from "react-native-chessboard";
import { Chess } from "chess.js";

export default function ChessScreen() {
  const chessboardRef = useRef<ChessboardRef>(null);
  const isRemoteMove = useRef(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [playerColor, setPlayerColor] = useState<string | null>(null);

  const [roomInput, setRoomInput] = useState("");
  const [activeRoom, setActiveRoom] = useState<string | null>(null);

  const connectToRoom = (roomName: string) => {
    const serverUrl = `ws://{Your:IP}:8000/ws/chess/${roomName}/`;
    const websocket = new WebSocket(serverUrl);

    websocket.onopen = () => console.log(`✅ Connected to Room: ${roomName}`);

    websocket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.action === "assign_color") {
        console.log("Server assigned color:", data.color);
        setPlayerColor(data.color);
      }

      if (data.action === "move") {
        isRemoteMove.current = true;
        setTimeout(() => {
          chessboardRef.current?.move({ from: data.from, to: data.to });
        }, 50);
      }
    };

    websocket.onerror = () => {
      console.log("❌ Connection Error.");
      Alert.alert("Error", "Could not connect to the server.");
    };

    setWs(websocket);
    setActiveRoom(roomName);
  };

  const checkGameOver = (fen: string) => {
    const chess = new Chess(fen);
    if (chess.isGameOver()) {
      if (chess.isCheckmate()) Alert.alert("Checkmate!", "Game Over.");
      else Alert.alert("Game Over", "It's a draw!");
    }
  };

  if (!activeRoom) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Enter Room Code</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 1234"
          value={roomInput}
          onChangeText={setRoomInput}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => connectToRoom(roomInput)}
        >
          <Text style={styles.buttonText}>Join Game</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!playerColor) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Joining Match...</Text>
        <Text style={styles.statusSubtext}>Connecting to server...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.roomLabel}>Room: {activeRoom}</Text>
        <Text style={styles.roleText}>
          You are playing: {playerColor === "w" ? "White ♙" : "Black ♟"}
        </Text>
      </View>

      <Chessboard
        ref={chessboardRef}
        onMove={(info) => {
          if (isRemoteMove.current) {
            isRemoteMove.current = false;
            checkGameOver(info.state.fen);
            return;
          }

          if (playerColor && info.move.color !== playerColor) {
            Alert.alert("Hold on!", "You can only move your own pieces.");
            return;
          }

          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                action: "move",
                from: info.move.from,
                to: info.move.to,
                fen: info.state.fen,
              }),
            );
          }
          checkGameOver(info.state.fen);
        }}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ECEED4",
  },
  header: { marginBottom: 30, alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", color: "#333" },
  roomLabel: { fontSize: 22, fontWeight: "600", color: "#555" },
  roleText: { fontSize: 18, color: "#666", marginTop: 5, fontWeight: "500" },
  statusSubtext: { marginTop: 10, color: "#888", fontSize: 16 },
  input: {
    height: 60,
    width: 220,
    backgroundColor: "white",
    borderRadius: 12,
    marginVertical: 20,
    textAlign: "center",
    fontSize: 24,
    borderWidth: 1.5,
    borderColor: "#ccc",
  },
  button: {
    backgroundColor: "#4A4A4A",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 12,
    elevation: 3,
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 18 },
});
