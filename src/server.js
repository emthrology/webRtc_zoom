import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set('view engine', "pug");
app.set("views", __dirname + "/views");

app.use("/public",express.static(__dirname + "/public"));

app.get("/", (req,res) => res.render("home"));
app.get("/*", (req,res) => res.redirect("/"));


//make both http server & ws server on the same server and port 
//(not necessary wss is on http server, wss is independant)
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

//SocketIO
wsServer.on("connection", socket => {
  //onAny: eventListener of any kind
  socket.onAny(event => {
    console.log(`Socket Event: ${event}`);
  });
  //socketIO is able to make custom event, which is why socketIO is event-based
  socket.on("enter_room", (roomObj, done) => {
    const roomName = roomObj.payload;
    socket.join(roomName);
    
    //when function done is called, function at the front(emit's thrid argument) is invoked
    //NOT the backend's function
    setTimeout(() => done("this is from backend"),0); //mock async
    socket.to(roomName).emit("welcome"); //emit custom event to browser

  });
})

/* WebSocket 
const wss = new WebSocket.Server({ server });
const sockets = [];
wss.on("connection", (socket) => {
  sockets.push(socket); //??
  
  socket["nickName"] = "annonymous";
  console.log("connected to browser");
  socket.send("connected to the server");
  socket.on("message",(msg) => {
    const msgObj = JSON.parse(msg);
    switch(msgObj.type) {
      case "message":
        sockets.forEach(aSocket => {
          aSocket.send(`${socket.nickName}: ${msgObj.payload}`);
        });
        break;
      case "nickName":
        //put nickname in the socket object element of sockets array;
        socket["nickName"] = msgObj.payload;
    }
  });
  socket.on("close", () => {
    console.log("disconnected from browser");
  });
});
*/

const handleListen = () => console.log("listening on 'http://localhost:3000'");

httpServer.listen(3000,handleListen);