import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set('view engine', "pug");
app.set("views", __dirname + "/views");

app.use("/public",express.static(__dirname + "/public"));

app.get("/", (req,res) => res.render("home"));
app.get("/*", (req,res) => res.redirect("/"));


//make both http server & ws server on the same server and port (not necessary wss is on http server, wss is independant)
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


const handleListen = () => console.log("listening on 'http://localhost:3000'");


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
server.listen(3000,handleListen);