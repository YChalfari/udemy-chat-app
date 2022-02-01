const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

//socket.io needs us to pass in http.createServer explicitly so we need to import it manually
//even though express does it automatically
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3001;
const publicDirectory = path.join(__dirname, "../public");

app.use(express.static(publicDirectory));

io.on("connection", (socket) => {
  console.log("new connection");
  socket.emit("welcome", "Welcome!");
  //broadcast to all besides for the user (socket) who connected
  socket.broadcast.emit("message", "A new user has joined");
  //the callback is to acknowledge the event(notify client that the message was recieved)
  //this callback is from the 3rd param of the emitter
  socket.on("sendMessage", (m, callback) => {
    io.emit("sendMessage", m);
    //the callback can be empty or can put data to deliver
    callback("Delivered");
  });
  //listen and broadcast location
  socket.on("sendLocation", (pos) => {
    console.log("hello?");
    io.emit("message", `https://www.google.com/maps/@${pos.lat},${pos.long}`);
  });
  //to listen to disconnections we don't use io.on
  socket.on("disconnect", () => {
    io.emit("message", "A user has left");
  });
});

server.listen(port, () => {
  console.log(`listening on ${port}`);
});
