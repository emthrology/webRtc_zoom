import http from "http";
import { Server } from "socket.io";
import { instrument  } from "@socket.io/admin-ui";
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
const wsServer = new Server(httpServer,{
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  }
});

instrument(wsServer, {
  auth: false,
})

function publicRooms() {
  const { sids, rooms } = wsServer.sockets.adapter;
  //or you can do this;
  // const { 
  //   sockets: { 
  //     adapter: { sids, rooms } 
  //   } 
  // } = wsServer;
  
  const publicRooms = [];
  rooms.forEach((_,key) => {
    if(sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoomUser(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

//SocketIO
wsServer.on("connection", socket => {
  
  //onAny: eventListener of any kind
  socket.onAny(event => {
    console.log(`Socket Event: ${event}`);
  });
  //socketIO is able to make custom event, which is why socketIO is event-based framework
  socket.on("enter_room", (roomObj, done) => {
    const roomName = roomObj.room;
    socket["nickname"] = roomObj.nick || "annonymous_default";
    socket.join(roomName);
    
    //when function done is called, function at the front evnet's last argument is invoked
    //NOT the backend's function
    setTimeout(() => done({
      msg:"this is from backend", 
      cnt:countRoomUser(roomName)
    }),0); //mock async test
    socket.to(roomName).emit("welcome", socket.nickname, countRoomUser(roomName)); //emit custom event to browser
    //this will goes to entire users on connected
    wsServer.sockets.emit("room_change", publicRooms());
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
    socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname, countRoomUser(room) - 1));
  });

  //know the differences?

  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  })
})



const handleListen = () => console.log("listening on 'http://localhost:3000'");

httpServer.listen(3000,handleListen);