// const messageList = document.querySelector("ul");
// const messageForm = document.querySelector("#message");
// const nickForm = document.querySelector("#nickName")
// const socket = new WebSocket(`ws://${window.location.host}`);

// socket.addEventListener("open",() => {
//   console.log("connected to server");
// });

// socket.addEventListener("message", (msg) => {
//   // console.log(`New message: "${msg.data}"`);
//   const li = document.createElement("li");
//   li.innerText = msg.data;
//   messageList.append(li);
// });

// socket.addEventListener("close", () => {
//   console.log("disconnected from server");
// });

// function makeMessage(type, payload) {
//   const msg = { type, payload };
//   return JSON.stringify(msg);
// } 

// function handleSubmit(evt, formType) {
//   evt.preventDefault();
//   const input = formType.querySelector("input");
//   socket.send(makeMessage(formType.id, input.value));
//   input.value = "";
// }

// messageForm.addEventListener("submit", (e) => handleSubmit(e, messageForm));
// nickForm.addEventListener("submit", (e) => handleSubmit(e, nickForm));


const socket = io();
const welcome = document.querySelector("#welcome");
const form = document.querySelector("form");

function handleRoomSubmit(evt,target) {
  evt.preventDefault();
  const input = target.querySelector("input");
  //socketIO is able to make custom event, which is why socketIO is event-based
  //in SocketIO, developer dosen't have to make js object into JSON 
  //third parameter is callback from server
  socket.emit("enter_room", 
    { payload: input.value },
    (...args) => {
      console.log("bacnend job is done");
      console.log(args); 
  });
  input.value = "";
}

form.addEventListener("submit", (e) => handleRoomSubmit(e, form));