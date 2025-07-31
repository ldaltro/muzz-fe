import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import { SocketMessage, ChatMessage } from "./types";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

io.on("connection", (socket: Socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (room: string) => {
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined room: ${room}`);
  });

  socket.on("send_message", (data: SocketMessage) => {
    const message: ChatMessage = {
      ...data.message,
      id: uuidv4(),
      createdAt: Date.now()
    };

    // Persist in memory
    const arr = roomMessages[data.room] ?? [];
    arr.push(message);
    if (arr.length > MAX_HISTORY) arr.shift(); // drop oldest
    roomMessages[data.room] = arr;

    io.to(data.room).emit("receive_message", message);
    console.log(`Message sent to room ${data.room}:`, message);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// In-memory message store
const roomMessages: Record<string, ChatMessage[]> = {};
const MAX_HISTORY = 500;

app.get("/rooms/:room/messages", (req, res) => {
  const { room } = req.params;
  const before = Number(req.query.before) || Date.now();
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const history = (roomMessages[room] || [])
    .filter(m => m.createdAt < before)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);

  res.json(history);
});

// Start the server on port 3001
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
