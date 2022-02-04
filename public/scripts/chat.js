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
const sidebarTemplate= document.querySelector("#sidebar-template").innerHTML

//use qs library to parse the path location query 
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})
console.log(username,room);
// autoscroll func
const autoscroll = () =>{
  //get new message el
  const $newMessage = $messages.lastElementChild
  //get heigh of new message
  const newMessageStyles = getcomputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
  //visible height
  const visibleHeight = $messages.offsetHeight
  //height of messages container
  const containerHeight = $messages.scrollHeight
  //get current scroll from top
  const scrollOffset = $messages.scrollTop + visibleHeight
  //check if we were at the bottom before the new message was added
  if (containerHeight - newMessageHeight <= scrollOffset) {
    //set the scroll from top value to the full height (scroll all the way down)
    $messages.scrollTop = $messages.scrollHeight
  }
}

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

  });
  // $messageForm.reset();
});

socket.on("sendMessage", (m) => {
  // messageBox.innerHTML += `<p>${m}</p>`;
  // console.log(m);
  const html = Mustache.render(messageTemplate, {
    username: m.username,
    message: m.text,
    createdAt: moment(m.createdAt).format("h:mm a"),

  });
  $messages.insertAdjacentHTML("beforeend", html);
     autoscroll()
});

socket.on("message", (m) => {
  const html = Mustache.render(messageTemplate, {
    username: m.username,
    message: m.text,
    createdAt: moment(m.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
     autoscroll()
});

socket.on("welcome", (welcome) => {
  console.log(welcome);
});

//get room data for sidebar
socket.on('roomData', ({room,users})=>{
  const html = Mustache.render(sidebarTemplate,{
    room,
    users,
  })
  document.querySelector("#sidebar").innerHTML = html
} )

socket.on("locationMessage", (message) => {
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.url,
        createdAt: moment(message.createdAt).format("h:mm a"),

  });
  $messages.insertAdjacentHTML("beforeend", html);
     autoscroll()
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

//request to join a specific room
socket.emit('join', {username,room},(error)=>{
  //if the acknowledge callback returns an error alert user of error and
  //redirect them to the login page
  if(error){
    alert(error)
    location.href = '/'
  }
})