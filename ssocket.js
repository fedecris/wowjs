const socket = require("socket.io");

let theSocket = null;

// Crea el server socket
function createServerSocket(server) {
  io = socket(server);
  io.sockets.on("connection", (aSocket) => {
    theSocket = aSocket;
    console.log(`New Connection: ${aSocket.id}`);
  });
}

// Envio de estado
function sendStatus(queue, content) {
  console.log(`Sending data: ${queue} - ${content}`);
  if (theSocket) {
    theSocket.emit(queue, content);
  }
}

module.exports = { createServerSocket, sendStatus };
