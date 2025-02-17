const express = require("express")
const mongoose = require("mongoose")
const authRouter = require("./Routes/auth")
const messageRouter = require("./Routes/messageRouter")
const cors = require('cors')
const passport = require('passport');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session)
require('dotenv').config()

// Socket import
const { createServer } = require("http");
const { Server } = require("socket.io");


const store = new MongoDBStore({
    uri: process.env.MONGO_DB_URI,
    collection: 'mySessions'
})

const app = express()
const PORT = process.env.PORT || 8000

app.set("trust proxy", 1);
app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000})) 
app.use(session({ 
    secret: 'keyboard cat',
    resave: false, 
    saveUninitialized: false,
    proxy: true,
    store: store,
    cookie: {
        secure: true, // Set to true if you're using HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        sameSite: "none",
        // domain: "https://frontend-chat-app-dusky.vercel.app"
    },
})); 

app.set('trust proxy', 1);
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', "https://frontend-chat-app-dusky.vercel.app"); // Replace with your React app's origin
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('credentials', 'true');
    res.header("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS");
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});


app.use(passport.authenticate('session'));
app.use("/", authRouter)
app.use("/", messageRouter)
  

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "https://frontend-chat-app-dusky.vercel.app",
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        methods: ["GET", "POST"],
    } 
});

let onlineUser = []
const getSenderId = (socketId) =>{
    for(let i=0; i<onlineUser.length; i++){
        if(onlineUser[i]["socketId"] == socketId){
            return onlineUser[i]["userId"]
        }
    }
}
io.on("connection", (socket) => {
    socket.on("user_connect", (userId) =>{
        if(onlineUser.length < 1){
            onlineUser.push({"userId": userId, "socketId": socket.id})
            console.log('New user has been connected')
        }else{
            for(let i=0; i<onlineUser.length; i++){
                if(onlineUser[i]["userId"] == userId){
                    break  
                }
                if(i == onlineUser.length - 1){
                    onlineUser.push({"userId": userId, "socketId": socket.id})
                    console.log('New user has been connected')
                } 
            }
        }  
    }) 

    socket.on("messageSend", ([message, toUserId]) =>{
        for(let i = 0; i < onlineUser.length; i++){
            if(onlineUser[i]["userId"] == toUserId){
                io.to(onlineUser[i]["socketId"]).emit("sendSpecificMsg", [getSenderId(socket.id), message])
                break  
            }  
            
        }     
    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
        onlineUser = onlineUser.filter(obj => obj.socketId !== socket.id)
      }); 
      
  // ... 
});

const startServer = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_DB_URI, {
            serverSelectionTimeoutMS: 5000, // Adjust as needed
        })
        console.log("Mongodb running ....");
        httpServer.listen(PORT, () => console.log('Server running on port ' + PORT))
    } catch (error) {        
        console.log(error.message);
    }
}
startServer()


