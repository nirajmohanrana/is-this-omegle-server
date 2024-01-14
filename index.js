const { Server } = require("socket.io");

const io = new Server(8000, { cors: true });

const emailToSocketIdMaping = new Map();
const socketIdToEmailMaping = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected ${socket.id}`);

  socket.on("room:join", ({ email, room }) => {
    emailToSocketIdMaping.set(email, socket.id);
    socketIdToEmailMaping.set(socket.id, email);

    io.to(room).emit("user:joined", { email, id: socket.id });

    socket.join(room);
    io.to(socket.id).emit("room:join", { email, room });
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("chat:message", ({ room, message }) => {
    console.log({ room, message });
    const eventKey = `chat:message:${room}`;

    const email = emailToSocketIdMaping.get(socket.id);
    console.log("email", email);

    io.to(room).emit(eventKey, { from: socket.id, message });
  });
});
