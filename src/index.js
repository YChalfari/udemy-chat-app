const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {addUser, getUser, getUsersInRoom, removeUser} = require('./utils/users')
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
//!3 main types of emits
//socket.emit -sends event to specific client
//io.emit - sends even to all connected client
//socket.broadcast.emit - sends event to all connected client besides for the sender
io.on("connection", (socket) => {
  //listen for join request to a specific room
  socket.on('join',({username,room},callback)=>{
    //add user to users array
    //since addUser is trimming and tolowercase the room and username
    //we use the results of addUser
    const {error,user} =addUser({id:socket.id, username, room})
    if (error) {
      //if error well send it via the join awknowledgement callback
      return callback(error)
    }
    //connect the socket(user) to the room
    socket.join(user.room)
    //io.to().emit - emits event to everyone in a specific room
    //socket.broadcast.to().emit - emits event to everyone in a room besides for sender
    socket.emit("message", generateMessage("Admin","Welcome!"));
    //broadcast to all besides for the user (socket) who connected
    socket.broadcast.to(user.room).emit("message", generateMessage("Admin",`${user.username} has joined`));
    //broadcast list of users in the room to to the room
    io.to(user.room).emit("roomData", {room:user.room, users:getUsersInRoom(user.room)})
    
    //awknowledge that everything went ok using the callback without any arguements
    callback()
  })
  //the callback is to acknowledge the event(notify client that the message was recieved)
  //this callback is from the 3rd param of the emitter
  //only the emitter recieves the acknowledgement
  socket.on("sendMessage", (m, callback) => {
    const user = getUser(socket.id)
    
    // innitialize bad-words
    const filter = new Filter();
    if (filter.isProfane(m)) {
      return callback("Profanity is not allowed");
    }
    //you can emit to a different room by putting the room string in io.to()
    io.to(user.room).emit("sendMessage", generateMessage(user.username,m));
    //the callback can be empty or can put data to deliver
    callback();
  });
  //listen and broadcast location
  socket.on("sendLocation", (pos, acknowledgeCallback) => {
    const user = getUser(socket.id)
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://www.google.com/maps/@${pos.lat},${pos.long}`
      )
    );
    acknowledgeCallback("Positions delivered");
  });
  //to listen to disconnections we don't use io.on
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", generateMessage("Admin",`${user.username} has left`));
      io.to(user.room).emit("roomdata", {room:user.room, users: getUsersInRoom(user.room)})
    }    
  });
});

server.listen(port, () => {
  console.log(`listening on ${port}`);
});


