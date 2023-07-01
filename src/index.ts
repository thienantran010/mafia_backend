// libraries
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";

// routes
import authRouter from "./routes/authRoutes";
import openGameRouter from './routes/openGameRoutes';

// models
import { OpenGame } from './models/openGameModel';
import { User } from './models/userModel';

// middleware
import verifyJwt from "./middleware/verifyJwt";

// types
import { ChangeStreamDeleteDocument, ChangeStreamInsertDocument, ChangeStreamUpdateDocument} from 'mongodb';
import { OpenGameDocument } from './models/openGameModel';
import { UserDocument } from './models/userModel';
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
const connectionString = process.env.MONGODB_CONNECTION as string;
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
    // transports: ['websocket', 'polling'],
    credentials: true
  },
  allowEIO3: true
});
httpServer.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

// change streams
const openGameChangeStream = OpenGame.watch();

type ChangeStreamEvent = ChangeStreamInsertDocument<OpenGameDocument> 
                        | ChangeStreamDeleteDocument<OpenGameDocument>
                        | ChangeStreamUpdateDocument<OpenGameDocument>;

openGameChangeStream.on("change", (data: ChangeStreamEvent) => {

  // helper function to produce array of {_id: ObjectId, username: string}
  async function findAllUsernames (playerIds: mongoose.Types.ObjectId[]) {
    const playerObjs = await Promise.all(playerIds.map(async (playerId) => {
      const playerObj = await User.findById(playerId, 'username').exec();
      return playerObj;
    }));
    return playerObjs;
  }

  switch (data.operationType) {

    case 'insert':
      const playerIds = data.fullDocument.players;
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

      if (!data.updateDescription.updatedFields) {
        break;
      }

      const numPlayersJoined = data.updateDescription.updatedFields.numPlayersJoined;
      let players = data.updateDescription.updatedFields.players;

      // if a player joins the game, data.players doesn't exist
      // however, players.1 where the number is the index of the players array does exist
      // and contains the player id
      if (players !== undefined) {
        console.log(players);
        findAllUsernames(players).then((playerObjs) => {
          io.emit("openGame:update:leave", gameId, numPlayersJoined, playerObjs);
        });
        break;
      }

      else {
        console.log(data);
        try {
          const playerIds = Object.values(data.updateDescription.updatedFields).filter((value) => {
            return value instanceof mongoose.Types.ObjectId;
          });

          if (playerIds.length > 0) {
            findAllUsernames(playerIds).then((playerObjs) => {
              io.emit("openGame:update:join", gameId, numPlayersJoined, playerObjs)
            })
          }
  
        }
        catch (error) {
          console.log("error");
        }
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
app.use('/openGames', openGameRouter);