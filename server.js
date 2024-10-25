require("dotenv").config();
const express = require("express");
const http = require("http");
const { initializeMongoDB } = require("./functions/mongoClient");
const {
  handleSyncVehicle,
  handleDisconnect,
  handleTargetInserted,
  handleSyncRequest,
  handleVehicleInserted,
  handleDataBatch,
} = require("./functions/handleFunctions");
const { io } = require("socket.io-client");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const mainServer = process.env.MAIN_SERVER;
const clientName = process.env.CLIENT_NAME;
const { ip_data } = require("./functions/ipaddress");

// Create socket connection to Main Server
const socket = io(mainServer);

// เชื่อมต่อกับ Socket.IO
const initSocketConnection = async () => {
  socket.on("connect", async () => {
    console.log(`Connected to Main Server as ${mainServer}`);
    await initializeMongoDB();
    registerClient();
    // No need to handle initial sync here
  });
  
  socket.on("disconnect", handleDisconnect);
  initializeSocketListeners();
};

// Register the client with the main server
const registerClient = () => {
  const { ipv4_address  } = ip_data;
  console.log(`ipv4_address: ${ipv4_address }`);
  // socket.emit("register-client", { clientName, socketID: socket.id });
  socket.emit("register-client", { clientName, ipv4_address  });
};

// Send acknowledgment to the main server
const sendAcknowledgment = (data) => {
  socket.emit("acknowledge-data", { clientName, data });
};

// Initialize event listeners
const initializeSocketListeners = () => {
  socket.on("target-inserted", handleTargetInserted);
  socket.on("vehicle-inserted", handleVehicleInserted);
  socket.on("data-batch", handleDataBatch);
  socket.on("sync-vehicle", handleSyncVehicle);
  socket.on("request-sync", handleSyncRequest);
};

// Start the client
const startClient = () => {
  initSocketConnection();
  initializeSocketListeners();
  server.listen(PORT, () => {
    console.log(`${clientName} is running on port ${PORT}`);
  });
};

// Run the client
startClient();
