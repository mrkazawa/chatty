const { io } = require("socket.io-client");
const readlinePromises = require('node:readline/promises');
const rl = readlinePromises.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const domain = "localhost";
const port = 8080;

const url = "http://" + domain + ":" + port.toString();
const socket = io(url);
const users = new Map();

let username;

socket.on("connect", async () => {
  console.log("Connected with id:", socket.id);
  socket.emit("user-info");

  username = await rl.question("What is your username? ");
  console.log(`Hello ${username}, welcome to Chatty!`);

  const data = {
    username: username,
    socketId: socket.id,
    time: Math.floor(Date.now() / 1000) // epoch time
  };
  socket.emit("register", data);
});

socket.on("disconnect", () => {
  console.log("Disconnected!");
  process.exit(0);
});

socket.on("user-info", (data) => {
  for (let i = 0; i < data.keys.length; i++) {
    const k = data.keys[i];
    const v = data.values[i];
    const value = {
      socketId: v.socketId,
      time: v.time
    };
    users.set(k, value);
  }
});

socket.on("register", (data) => {
  const value = {
    socketId: data.socketId,
    time: data.time
  };
  users.set(data.username, value);
});

socket.on("chat", (data) => {
  console.log(`${data.sender}: ${data.msg}`);
});

// triggered on end-of-line input (\n, \r, or \r\n)
rl.on("line", (input) => {
  if (input == "!users") {
    console.log(users);
  } else {
    const data = {
      "sender": username,
      "msg": input
    };
    socket.emit("chat", data);
  }
});

// triggered on CTRL+C like command
rl.on('SIGINT', () => {
  process.exit(0);
});