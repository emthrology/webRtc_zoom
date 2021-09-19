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

wss.on("connection", (socket) => {
  console.log("connected to browser");
  socket.send("hello from server");
  socket.on("message",(msg) => {
    console.log(msg.toString("utf-8"));
  });
  socket.on("close", () => {
    console.log("disconnected from browser");
  });
});
server.listen(3000,handleListen);