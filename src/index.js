const express = require('express');
const dotenv = require('dotenv');
const { authRouter } = require ('./routes/authRoutes');
const bodyParser = require('body-parser');
const { verifyJwt } = require('./middleware/verifyJwt');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { createServer } = require("http");
const { Server } = require("socket.io");
const { OpenGame } = require('./models/openGameModel');
const { openGameRouter } = require('./routes/openGameRoutes');
const { User } = require('./models/userModel');

// configuration
dotenv.config();
const app = express();
const port = process.env.PORT;
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true
}

// connecting to database
mongoose.set("strictQuery", false);
const connectionString = process.env.MONGODB_CONNECTION;
mongoose.connect(connectionString);
const database = mongoose.connection;
database.on('error', (error) => {
    console.log(error)
})
database.once('connected', () => {
    console.log('Connected to MongoDB database');
})

// socket.io stuff
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    transports: ['websocket', 'polling'],
    credentials: true
  },
  allowEIO3: true
});
httpServer.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

// change streams
const openGameChangeStream = OpenGame.watch();

openGameChangeStream.on("change", data => {
  switch (data.operationType) {

    // return a game with these fields:
    // _id: objectId;
    // name: string;
    // roles: string[];
    // players: {_id: objectId, username: string}[];
    // numPlayersJoined: number;
    // numPlayersMax: number;
    // __v: number
    case 'insert':
      const playerIds = data.fullDocument.players;
      async function findAllUsernames (playerIds) {
        const playerObjs = await Promise.all(playerIds.map(async (playerId) => {
          const playerObj = await User.findById(playerId, 'username').exec();
          return playerObj;
        }));
        return playerObjs;
      }

      findAllUsernames(playerIds).then((playerObjs) => {
        const gameObj = {...data.fullDocument, players: playerObjs};
        io.emit("openGame:create", gameObj);
      });
      break;
    case 'delete':
      io.emit("openGame:delete", data.documentKey._id)
      break;
    // only update possible is players joining/leaving the game
    case 'update':
      console.log('updating game');
      const gameId = data.documentKey._id;
      const numPlayersJoined = data.updateDescription.updatedFields.numPlayersJoined;
      let players = data.updateDescription.updatedFields.players;

      // if a player joins the game, data.players doesn't exist
      // however, players.1 where the number is the index of the players array does exist
      // and contains the player id
      if (players === undefined) {
        try {
          async function getPlayer(playerId) {
            const playerObj = await User.findById(playerId, 'username').exec();
            return playerObj;
          }
          
          // getting the key for the updated field
          const key = Object.keys(data.updateDescription.updatedFields).filter((key) => {
            return key.indexOf('players') === 0
          })[0];
          
          // getting the player id
          const playerId = data.updateDescription.updatedFields[key];
  
          getPlayer(playerId).then((playerObj) => {
            io.emit("openGame:update:join", gameId, numPlayersJoined, playerObj);
          });
  
        }
        catch (error) {
          console.log("error");
        }

        break;
      }
      else {
        async function findAllUsernames (players) {
          const playerObjs = await Promise.all(players.map(async (player) => {
            const playerObj = await User.findById(player, 'username').exec();
            return playerObj;
          }));
          return playerObjs;
        }
  
        findAllUsernames(players).then((playerObjs) => {
          io.emit("openGame:update:leave", gameId, numPlayersJoined, playerObjs);
        });

        break;
      }
  }
})

// middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use('/auth', authRouter);
app.use(verifyJwt);
app.use('/', openGameRouter);
app.get('/', async (req, res) => {
    res.json({message: `Welcome home ${req.email}`})
});
app.use('/openGames', openGameRouter);