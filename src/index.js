// src/index.js
require("dotenv").config();
const app = require("./app.js");
const http = require("http");
const path = require("path")
const { Server } = require('socket.io');
const { Client } = require('whatsapp-web.js');
const LocalWebCache = require("whatsapp-web.js/src/webCache/LocalWebCache.js");
const RemoteWebCache = require("whatsapp-web.js/src/webCache/RemoteWebCache.js");

const port = normalizePort(process.env.PORT || "3000");
const server = http.createServer(app.callback());

let pairingCodeRequested = false;

const io = new Server(server);

const client = new Client({
  RemoteWebCache: new RemoteWebCache({
    remotePath: "http://localhost:3000/2.3000.1015851946.html",
    strict: true
  })
});

io.on('connection', (socket) => {
  console.log('User connected.');

  client.on('loading_screen', (percent, message) => {
    socket.emit('loading_screen', { message: `LOADING ${percent} ${message}` });
  });

  client.on('qr', async (qr) => {
    const pairingCodeEnabled = true;
    if (pairingCodeEnabled && !pairingCodeRequested) {
      const pairingCode = await client.requestPairingCode('6285183020580'); // enter the target phone number
      socket.emit('qr', { message: `Pairing code enabled, code:  ${pairingCode}` });
      pairingCodeRequested = true;
    }
  });

  client.on('authenticated', () => {
    socket.emit('authenticated', { message: `AUTHENTICATED` });
  });

  client.on('auth_failure', msg => {
    socket.emit('auth_failure', { message: `AUTHENTICATION FAILURE ${msg}` });
  });

  client.on('ready', async () => {
    const debugWWebVersion = await client.getWWebVersion();
    socket.emit('ready', { message: `WWebVersion = ${debugWWebVersion}` });
    client.pupPage.on('pageerror', function (err) {
      socket.emit('pageerror', { message: `Page error = ${err.toString()}` });
    });
    client.pupPage.on('error', function (err) {
      socket.emit('error', { message: `Page error = ${err.toString()}` });
    });
  });

  client.on('message_create', message => {
    if (message.fromMe === false && message.isStatus === false && message.isForwarded === false) {
      client.sendMessage(message.from, 'Ok!');
      socket.emit('message_create', {
        from: message.from,
        to: message.to,
        isStatus: message.isStatus,
        timestamp: message.timestamp
      });
    }
  });
  client.on('remote_session_saved', () => {
    socket.emit('remote_session_saved', { message: "remote session saved" });
    // Do Stuff...
  });

  socket.on('init', () => {
    client.initialize();
    socket.emit('init', "Initializing");
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// =============================================listen server=========================================
server.listen(port, "0.0.0.0");
server.on("error", onError);
server.on("listening", onListening);
// =============================================listen server=========================================

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  console.log("App started. Listening on " + bind);
}

module.exports = server
