const socket = io();
const messageInput = document.querySelector("message");
const messageBox = document.querySelector(".message-box");
const messageForm = document.querySelector("#message-form");

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //we can target the input name from the forms e.target.elements
  const message = e.target.elements.message.value;
  //The data being emitted could be as many arguments as we want (not only message)
  //emit can take a callback as the last argument
  //if we want to recieve something upon being acknowledged we add a parameter
  socket.emit("sendMessage", message, (m) => {
    //this runs when even has been acknowledged (received by the listener)
    console.log("The message was delivered!", m);
  });

  messageForm.reset();
});

socket.on("sendMessage", (m) => {
  messageBox.innerHTML += `<p>${m}</p>`;
  console.log(m);
});
socket.on("message", (m) => {
  console.log(m);
  messageBox.innerHTML += `<p>${m}</p>`;
});

socket.on("welcome", (welcome) => {
  console.log(welcome);
});

document.querySelector("#send-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("your browser does not support geolocation");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit("sendLocation", {
      lat: position.coords.latitude,
      long: position.coords.longitude,
    });
  });
});
