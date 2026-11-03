const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express(), server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.use(express.static("public"));
const players = new Map(), requests = new Map(), rooms = new Map([["public",{name:"PÚBLICA",members:new Set()}]]);
function publicPlayers(){return [...players.values()].map(p=>({id:p.id,name:p.name,character:p.character,x:p.x,z:p.z,rot:p.rot}));}
function sendLists(){io.emit("players",publicPlayers());io.emit("positions",publicPlayers());}
io.on("connection",socket=>{
 socket.on("join",data=>{
  let name=String(data?.name||"").replace(/[<>]/g,"").trim().slice(0,16);
  if(!name)return socket.emit("joinError","Nombre inválido");
  if([...players.values()].some(p=>p.name.toLowerCase()===name.toLowerCase()))return socket.emit("joinError","Ese nombre ya está en uso");
  const p={id:socket.id,name,character:String(data.character||"ADAM").slice(0,20),x:(Math.random()-.5)*5,z:(Math.random()-.5)*5,rot:0,hp:100,room:"public"};
  players.set(socket.id,p);rooms.get("public").members.add(socket.id);socket.join("public");
  socket.emit("joined",{id:socket.id});socket.emit("roomUpdate",{name:"PÚBLICA"});sendLists();
  socket.emit("friendRequests",[...(requests.get(socket.id)||[])]);
 });
 socket.on("move",d=>{let p=players.get(socket.id);if(!p)return;p.x=Math.max(-45,Math.min(45,Number(d.x)||0));p.z=Math.max(-45,Math.min(45,Number(d.z)||0));p.rot=Number(d.rot)||0;sendLists()});
 socket.on("friendRequest",target=>{
  const targetId=String(target||"");const from=players.get(socket.id),to=players.get(targetId);
  if(!from||!to||from.id===to.id)return;
  let arr=requests.get(targetId)||[];if(arr.some(r=>r.id===socket.id))return;
  arr.push({id:socket.id,name:from.name});requests.set(targetId,arr);
  io.to(targetId).emit("friendRequests",arr);socket.emit("friendUpdate","Solicitud enviada a "+to.name);
 });
 socket.on("friendAccept",id=>{let arr=requests.get(socket.id)||[],r=arr.find(x=>x.id===id);if(!r)return;requests.set(socket.id,arr.filter(x=>x.id!==id));io.to(socket.id).emit("friendRequests",requests.get(socket.id));io.to(id).emit("friendUpdate",players.get(socket.id)?.name+" aceptó tu solicitud");socket.emit("friendUpdate","Ahora son amigos")});
 socket.on("friendReject",id=>{requests.set(socket.id,(requests.get(socket.id)||[]).filter(x=>x.id!==id));socket.emit("friendRequests",requests.get(socket.id))});
 socket.on("createRoom",()=>{let id="r"+Math.random().toString(36).slice(2,8),name="SALA-"+id.slice(1).toUpperCase();rooms.set(id,{name,members:new Set([socket.id])});let p=players.get(socket.id);if(p){rooms.get(p.room)?.members.delete(socket.id);socket.leave(p.room);p.room=id;socket.join(id)}socket.emit("roomCreated",{roomId:id,name});socket.emit("roomUpdate",{name})});
 socket.on("joinRoom",id=>{let room=rooms.get(String(id));let p=players.get(socket.id);if(!room||!p)return;rooms.get(p.room)?.members.delete(socket.id);socket.leave(p.room);room.members.add(socket.id);p.room=String(id);socket.join(String(id));socket.emit("roomUpdate",{name:room.name})});
 socket.on("chat",text=>{let p=players.get(socket.id);if(!p)return;let clean=String(text||"").replace(/[<>]/g,"").trim().slice(0,120);if(clean)io.to(p.room).emit("chat",{name:p.name,text:clean})});
 socket.on("shoot",()=>{let p=players.get(socket.id);if(!p)return;io.to(p.room).emit("shot",{x:p.x,z:p.z+1.5});});
 socket.on("disconnect",()=>{let p=players.get(socket.id);if(p){rooms.get(p.room)?.members.delete(socket.id);players.delete(socket.id);sendLists()}});
});
const port=process.env.PORT||3000;server.listen(port,"0.0.0.0",()=>console.log("PECADO online en puerto "+port));
