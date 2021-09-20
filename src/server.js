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
    const roomName = roomObj.room;
    socket["nickname"] = roomObj.nick || "annonymous_default";
    socket.join(roomName);
    
    //when function done is called, function at the front(emit's thrid argument) is invoked
    //NOT the backend's function
    setTimeout(() => done("this is from backend"),0); //mock async
    socket.to(roomName).emit("welcome", socket.nickname); //emit custom event to browser

  });

  socket.on("nickname", (nickname,roomName,done) => {
    const oldNick = socket["nickname"] || "annonymous_default";
    socket["nickname"] = nickname;
    socket.to(roomName).emit("message",`${oldNick} has changed his/her nickname to ${nickname}`);
    done();
  });

  socket.on("message", (msg,roomName,done) => {
    socket.to(roomName).emit("message",`${socket.nickname}: ${msg}`);
    done();
  })

  socket.on("disconnecting", () => {
    socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname));
  });
})



const handleListen = () => console.log("listening on 'http://localhost:3000'");

httpServer.listen(3000,handleListen);