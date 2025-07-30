import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Listen for new connections
io.on("connection", (socket: Socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Event to join a specific room for a 1-on-1 chat
  socket.on("join_room", (room: string) => {
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined room: ${room}`);
  });

  // Event to send a message to a specific room
  socket.on("send_message", (data: { room: string; message: string }) => {
    // Emit the message only to the clients in the specified room
    io.to(data.room).emit("receive_message", data);
    console.log(`Message sent to room ${data.room}: ${data.message}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// Start the server on port 3001
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
