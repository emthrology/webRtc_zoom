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
  //in SocketIO, developer dosen't have to make js object to JSON 
  //third parameter is callback from server
  socket.emit("enter_room", { room:room.value, nick:nick.value },
    (args) => {
      console.log({args}); 
      showRoom(args["cnt"]);
      addMessage(`You entered the room: ${room.value}`);
  });
  roomName = room.value;
}

function haneldNicknameSubmit(evt,roomName,target) {
  evt.preventDefault();
  const input = target.querySelector("#name input");
  socket.emit("nickname`", input.value,roomName, () => {
    addMessage(`You have changed your nickname to ${input.value}`);
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

function showRoom(userCnt) {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${userCnt})`;
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
socket.on("welcome", (user,userCnt) => {
  addMessage(`${user} entered`);
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${userCnt})`;
});

//when annonymous function takes payloads and return the payloads to cb
//without any changes, the annonymous function and payloads can be omitted
//what you have to write is just a callback
socket.on("message", addMessage);
//socket.on("message", (msg) => addMessage(msg));

socket.on("bye", (user, userCnt) => {
  addMessage(`${user} left`);
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}(${userCnt})`;
});

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if(rooms.length === 0) {
    return;
  }
  rooms.forEach(room => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  })
});