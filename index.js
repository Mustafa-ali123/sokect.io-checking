const express = require("express");
const http = require("http");
// const io = require('socket.io-client')
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);


const User = require("./models/users") 
const Message = require("./models/message") 



const io = new Server(server, {
  cors: {
    // origin: ["http://localhost:3001", "http://192.168.18.200:3001"],
    origin: ["http://localhost:3001"],
    methods: ["GET", "POST"],
  },
});

const login = require("./routes/login");
const chats = require("./routes/chats");
const Group = require("./models/group");

mongoose.connect(process.env.MONGODB_ACCESS_LINK || process.env.MONGOOSE_PORT);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error: "));
db.once("open", () => {
  console.log("Database Connected");
});

app.use(express.json());
app.use(cors());

app.use("/api/login", login);
app.use("/api/chats", chats);

// io.on("connection", (socket) => {
//   socket.on("joinRoom", (email) => {
//     socket.join(email); 
//     console.log('Current rooms:', socket.rooms); // Log current rooms
//   });

//   socket.on("chatMessage", async (data) => {
//     const { senderEmail, receiverEmail, messageContent, accessKey } = data;

//     try {
//       const sender = await User.findOne({ email: senderEmail, accessKey });
//       const receiver = await User.findOne({ email: receiverEmail });
      
//       if (!sender || !receiver) {
//         console.log('Sender or receiver not found');
//         return;
//       }

//       const message = new Message({
//         sender: sender._id,
//         receiver: receiver._id,
//         message: messageContent,
//       });

//       await message.save();

//       // Emit to both sender and receiver room
//       console.log(`Emitting message to room: ${receiverEmail} and ${senderEmail}`);
      
//       socket.to(receiverEmail).emit("newMessage", message); // Send to receiver
//       socket.emit("newMessage", message); // Send to sender (self)
//     } catch (error) {
//       console.error("Error saving message:", error);
//     }
//   });



  

//   socket.on("disconnect", () => {
//     console.log("Client disconnected:", socket.id);
//   });
// });






// io.on("connection", (socket) => {
//   console.log(`New client connected: ${socket.id}`);

//   // Handle joining a chat room or group
//   socket.on("joinRoom", async (data) => {
//     const { email, groupId } = data;

//     if (groupId) {
//       // Join a group room
//       socket.join(groupId);
//       console.log(`Client ${socket.id} joined group room: ${groupId}`);
//     } else if (email) {
//       // Join a personal chat room
//       socket.join(email);
//       console.log(`Client ${socket.id} joined room: ${email}`);
//     } else {
//       console.error("No email or groupId provided for joining room.");
//     }
//   });

//   // Handle sending a chat message
//   socket.on("chatMessage", async (data) => {
//     const { senderEmail, receiverEmail, messageContent, accessKey, groupId } = data;

//     if (!senderEmail || !messageContent) {
//       console.error("Missing required fields for chatMessage");
//       return;
//     }

//     try {
//       const sender = await User.findOne({ email: senderEmail, accessKey });
      
//       if (!sender) {
//         console.log('Sender not found');
//         return;
//       }

//       let receiver;
//       if (receiverEmail) {
//         receiver = await User.findOne({ email: receiverEmail });
//         if (!receiver) {
//           console.log('Receiver not found');
//           return;
//         }
//       }

//       // Create and save the message
//       const message = new Message({
//         sender: sender._id,
//         receiver: receiver ? receiver._id : null,
//         message: messageContent,
//         groupId: groupId || null // Add groupId if it's a group message
//       });

//       await message.save();

//       if (groupId) {
//         // Broadcast to all members of the group
//         io.to(groupId).emit("newMessage", message);
//         console.log(`Emitting message to group: ${groupId}`);
//       } else if (receiverEmail) {
//         // Notify receiver
//         socket.to(receiverEmail).emit("newMessage", message);
//         // Notify sender (self)
//         socket.emit("newMessage", message);
//         console.log(`Emitting message to personal chat rooms: ${receiverEmail} and ${senderEmail}`);
//       }

//     } catch (error) {
//       console.error("Error saving or emitting message:", error);
//     }
//   });

//   // Handle disconnect
//   socket.on("disconnect", () => {
//     console.log(`Client disconnected: ${socket.id}`);
//   });
// });

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Handle joining a chat room or group
  socket.on("joinRoom", async (data) => {
    const { email, groupId } = data;

    if (groupId) {
      // Join a group room
      socket.join(groupId);
      console.log(`Client ${socket.id} joined group room: ${groupId}`);
    } else if (email) {
      // Join a personal chat room
      socket.join(email);
      console.log(`Client ${socket.id} joined room: ${email}`);
    } else {
      console.error("No email or groupId provided for joining room.");
    }
  });

  // Handle sending a chat message
  socket.on("chatMessage", async (data) => {
    const { senderUsername, receiverEmail, messageContent, accessKey, groupId } = data;

    if (!senderUsername || !messageContent) {
      console.error("Missing required fields for chatMessage");
      return;
    }
    try {
      const sender = await User.findOne({ username: senderUsername, accessKey });
      if (!sender) {
        console.log('Sender not found');
        return;
      }

      let receiver;
      if (receiverEmail) {
        receiver = await Group.findById(groupId)
        if (!receiver) {
          console.log('Group not found');
          return;
        }
      }

      const message = new Message({
        sender: sender._id,
        // receiver: receiver ? receiver._id : null,
        message: messageContent,
        groupId: groupId || null,
      });

      await message.save();

      const formateMsg = {
        sender: sender,
        // receiver: receiver ? receiver: null,
        message: messageContent,
        groupId: groupId || null,
      }
      if (groupId) {
        io.to(groupId).emit("newMessage", formateMsg);
        console.log(`Emitting message to group: ${groupId}`);
      } else if (receiverEmail) {
        socket.to(receiverEmail).emit("newMessage", formateMsg);
        socket.emit("newMessage", formateMsg);
        console.log(`Emitting message to rooms: ${receiverEmail} and ${senderUsername}`);
      }
    } catch (error) {
      console.error("Error saving or emitting message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Request errored. Please try again.";
  err.errors?.length
    ? res.status(statusCode).json({
        success: false,
        responseCode: statusCode,
        message: err.message,
        Paths: err.errors,
      })
    : res.status(statusCode).json({
        success: false,
        responseCode: statusCode,
        message: err.message,
      });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on port ${process.env.PORT || 3000}`);
});
