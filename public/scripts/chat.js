const socket = io();
const $messageForm = document.querySelector("#message-form");
const messageInput = $messageForm.querySelector("input");
const messageBox = document.querySelector(".message-box");
const $messageFormButton = $messageForm.querySelector("button");
const $locationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
//templates Mustache
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //disable form until after message was sent
  $messageFormButton.setAttribute("disabled", "disabled");
  //we can target the input name from the forms e.target.elements
  const message = e.target.elements.message.value;
  //The data being emitted could be as many arguments as we want (not only message)
  //emit can take a callback as the last argument
  //if we want to recieve something upon being acknowledged we add a parameter
  socket.emit("sendMessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled", "disabled");
    messageInput.value = "";
    messageInput.focus();
    //this runs when event has been acknowledged (received by the listener)
    if (error) {
      return console.log(error);
    }
    console.log("message delivered");
  });
  // $messageForm.reset();
});
socket.on("sendMessage", (m) => {
  // messageBox.innerHTML += `<p>${m}</p>`;
  // console.log(m);
  const html = Mustache.render(messageTemplate, {
    message: m.text,
  });
  $messages.insertAdjacentHTML("beforeend", html);
});
socket.on("message", (m) => {
  const html = Mustache.render(messageTemplate, {
    message: m.text,
    createdAt: moment(m.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});
socket.on("welcome", (welcome) => {
  console.log(welcome);
});
socket.on("locationMessage", (message) => {
  const html = Mustache.render(locationMessageTemplate, {
    url: message.url,
    createdAt: moment(message.createdAt).format(""),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

$locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("your browser does not support geolocation");
  }
  $locationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        lat: position.coords.latitude,
        long: position.coords.longitude,
      },
      (res) => {
        $locationButton.removeAttribute("disabled", "disabled");
        console.log(res);
      }
    );
  });
});
