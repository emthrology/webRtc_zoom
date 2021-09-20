const socket = io();
const welcome = document.querySelector("#welcome");
const infoForm = welcome.querySelector("form");
const room = document.querySelector("#room");

room.hidden = true;

let roomName;

function handleRoomSubmit(evt,target) {
  evt.preventDefault();
  const room = target.querySelector("#room-info");
  const nick = target.querySelector("#nick");
  //socketIO is able to make custom event, which is why socketIO is event-based
  //in SocketIO, developer dosen't have to make js object into JSON 
  //third parameter is callback from server
  socket.emit("enter_room", { room:room.value, nick:nick.value },
    (...args) => {
      console.log(args); 
      showRoom();
      addMessage(`You entered the room:${room.value}`);
  });
  roomName = room.value;
}

function haneldNicknameSubmit(evt,roomName,target) {
  evt.preventDefault();
  const input = target.querySelector("#name input");
  socket.emit("nickname", input.value,roomName, () => {
    addMessage(`You have changed your nickname into ${input.value}`);
  })
}

function handleMessageSubmit(evt,roomName,target) {
  evt.preventDefault();
  const input = target.querySelector("#message input");
  const value = input.value;
  socket.emit("message", value,roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector("#message");
  const nameForm = room.querySelector("#name");
  msgForm.addEventListener("submit",e => handleMessageSubmit(e,roomName,room));
  nameForm.addEventListener("submit",e => haneldNicknameSubmit(e,roomName,room));
}

function addMessage(msg) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
}

infoForm.addEventListener("submit", (e) => handleRoomSubmit(e, infoForm));

//handle custom event from server
socket.on("welcome", (user) => {
  addMessage(`${user} entered`);
});

socket.on("message", addMessage);

socket.on("bye", (user) => {
  addMessage(`${user} left`);
});