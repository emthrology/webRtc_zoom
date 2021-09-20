const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open",() => {
  console.log("connected to server");
});

socket.addEventListener("message", (msg) => {
  console.log(`New message: "${msg.data}"`);
});

socket.addEventListener("close", () => {
  console.log("disconnected from server");
});

setTimeout(() => {
  socket.send("hello from the browser");
},1000);



function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(input.value);
}

messageForm.addEventListener("submit", handleSubmit);