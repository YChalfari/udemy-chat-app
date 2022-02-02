const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
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
  socket.emit("message", generateMessage("Welcome!"));
  //broadcast to all besides for the user (socket) who connected
  socket.broadcast.emit("message", generateMessage("A new user has joined"));
  //the callback is to acknowledge the event(notify client that the message was recieved)
  //this callback is from the 3rd param of the emitter
  //only the emitter recieves the acknowledgement
  socket.on("sendMessage", (m, callback) => {
    // innitialize bad-words
    const filter = new Filter();
    if (filter.isProfane(m)) {
      return callback("Profanity is not allowed");
    }
    io.emit("sendMessage", generateMessage(m));
    //the callback can be empty or can put data to deliver
    callback();
  });
  //listen and broadcast location
  socket.on("sendLocation", (pos, acknowledgeCallback) => {
    io.emit(
      "locationMessage",
      generateLocationMessage(
        `https://www.google.com/maps/@${pos.lat},${pos.long}`
      )
    );
    acknowledgeCallback("Positions delivered");
  });
  //to listen to disconnections we don't use io.on
  socket.on("disconnect", () => {
    io.emit("message", generateMessage("A user has left"));
  });
});

server.listen(port, () => {
  console.log(`listening on ${port}`);
});

//get time function
