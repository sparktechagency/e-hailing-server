const http = require("http");
const { Server } = require("socket.io");

const app = require("../app");
const socketHandlers = require("../socket/socketHandlers");
const socketCors = require("./socketCors");
const { EnumSocketEvent } = require("../util/enum");

const mainServer = http.createServer(app);

const io = new Server(mainServer, {
  cors: socketCors,
});

const activeDrivers = new Map();

io.on(EnumSocketEvent.CONNECTION, (socket) => {
  socketHandlers(socket, io, activeDrivers);
});

module.exports = mainServer;
