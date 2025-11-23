import { Server } from "socket.io";

const io = new Server(3000, {
    cors: {
        origin: "http://localhost:3000", // İstemci adresi
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("Yeni bir kullanıcı bağlandı:", socket.id);

    socket.on("sendNotification", (data) => {
        io.emit("receiveNotification", data);
    });

    socket.on("disconnect", () => {
        console.log("Kullanıcı ayrıldı:", socket.id);
    });
});

console.log("WebSocket sunucusu 3006 portunda çalışıyor.");