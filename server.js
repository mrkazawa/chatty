const { Server } = require("socket.io");

const io = new Server();
const users = new Map();

io.on("connection", (socket) => {
  console.log(`user ${socket.id} is connected`);

  socket.on("disconnect", () => {
    console.log(`user ${socket.id} is disconnected`);
  });

  socket.on("user-info", () => {
    const data = {
      keys: Array.from(users.keys()),
      values: Array.from(users.values())
    };
    socket.emit("user-info", data);
  });

  socket.on("register", (data) => {
    const value = {
      socketId: data.socketId,
      time: data.time
    };
    users.set(data.username, value);
    socket.broadcast.emit("register", data);
  });

  socket.on("chat", (data) => {
    socket.broadcast.emit("chat", data);
  });
});

io.listen(8080);