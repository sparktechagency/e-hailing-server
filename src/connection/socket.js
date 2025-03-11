const http = require("http");
const { Server } = require("socket.io");

const app = require("../app");

const mainServer = http.createServer(app);

const io = new Server(mainServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

module.exports = mainServer;
