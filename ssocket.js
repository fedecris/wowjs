const socket = require("socket.io");

let theSocket = null;
let lastStatus = null;

// Crea el server socket
function createServerSocket(server) {
  io = socket(server);
  io.sockets.on("connection", (aSocket) => {
    theSocket = aSocket;
    console.log(`New Connection: ${aSocket.id}`);
    if (lastStatus)
      send(lastStatus.queue, lastStatus.content, lastStatus.finished);
  });
}

// Envio de estado
function send(queue, content, finished) {
  lastStatus = { queue: queue, content: content, finished: finished };
  console.log(`Sending data: ${queue} - ${content} - ${finished}`);
  if (theSocket) {
    theSocket.emit(queue, lastStatus);
  }
}

// Envio de estado, proceso no finalizado
function sendStatus(queue, content) {
  send(queue, content, false);
}

// Envio de estado finalizado (error o ok)
function sendStatusEnd(queue, content) {
  send(queue, content, true);
}

module.exports = { createServerSocket, sendStatus, sendStatusEnd };
